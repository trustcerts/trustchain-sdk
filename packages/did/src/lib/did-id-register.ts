import {
  Configuration,
  CreateDidIdDto,
  DidGatewayApi,
  AxiosError,
} from '@trustcerts/gateway';
import { Invite } from '@trustcerts/config';
import { CryptoKeyService, DecryptedKeyPair } from '@trustcerts/crypto';
import { DidCreation } from './did-creation';
import { DidIdIssuerService } from './did-issuer-service';
import { DidId } from './id/did-id';
import { DidIdResolver } from './id/did-id-resolver';
import { Identifier } from './identity';
import { logger } from '@trustcerts/logger';
import { wait } from '@trustcerts/helpers';

export class DidIdRegister {
  /**
   * creates a fresh did with a unique identifier. Add controller when they are passed.
   *
   * @param values
   */
  public static create(values?: DidCreation): DidId {
    // TODO check if a given id should be allowed
    const id = values?.id ?? Identifier.generate(DidId.objectName);
    const did = new DidId(id);
    values?.controllers?.forEach((controller) => did.addController(controller));
    return did;
  }

  public static async createByInvite(
    invite: Invite,
    cryptoKeyService: CryptoKeyService
  ): Promise<{ did: DidId; keyPair: DecryptedKeyPair }> {
    if (!invite.secret) {
      throw new Error('no invite secret found');
    }
    // generate first key pair
    const newKey = await cryptoKeyService.generateKeyPair(invite.id);
    // set first keypair to manipulate did
    const inviteValues: CreateDidIdDto = {
      identifier: invite.id,
      publicKey: newKey.publicKey,
      secret: invite.secret,
    };
    // register the key on the chain
    const configuration = new Configuration({
      basePath: invite.endpoint,
    });
    const api = new DidGatewayApi(configuration);
    await api
      .gatewayDidControllerCreate(inviteValues)
      .catch((err: AxiosError) => {
        if (err.response) {
          throw Error(JSON.stringify(err.response.data));
        } else {
          throw Error('error');
        }
      });
    logger.debug('first key registered, wait');
    // wait a bit so the observers have time to sync. Otherwhise only the gateway has the new transaction already passed
    await wait(1500);
    logger.debug('waited');
    // load own did document.
    const resolver = new DidIdResolver();
    logger.debug('load did');
    const did = await resolver.load(invite.id);
    logger.debug('did loaded');
    return {
      did,
      keyPair: newKey,
    };
  }

  public static save(did: DidId, client: DidIdIssuerService): Promise<void> {
    const value = did.getChanges();

    // const document = did.getDocument();
    did.version++;
    did.resetChanges();
    return client.persist(value);
  }
}
