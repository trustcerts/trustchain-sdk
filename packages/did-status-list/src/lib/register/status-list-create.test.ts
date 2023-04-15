import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import { CryptoService, defaultCryptoKeyService } from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import {
  DidStatusListRegister,
  DidStatusListResolver,
  StatusListService,
  StatusListIssuerService,
} from '@trustcerts/did-status-list';
import { WalletService } from '@trustcerts/wallet';
import { readFileSync } from 'fs';

describe('test statuslist service', () => {
  let config: ConfigService;

  let cryptoService: CryptoService;

  const testValues = JSON.parse(readFileSync('./values.json', 'utf-8'));

  beforeAll(async () => {
    DidNetworks.add(testValues.network.namespace, testValues.network);
    Identifier.setNetwork(testValues.network.namespace);
    config = new LocalConfigService(testValues.filePath);
    await config.init(testValues.configValues);

    const wallet = new WalletService(config);
    await wallet.init();

    cryptoService = new CryptoService();
    const key = (
      await wallet.findOrCreate(
        VerificationRelationshipType.assertionMethod,
        defaultCryptoKeyService.algorithm
      )
    )[0];
    await cryptoService.init(key);
  }, 10000);

  async function createStatusListService(
    statusListServicePath: string,
    statusListLength?: number
  ): Promise<StatusListService> {
    if (!config.config.invite) throw new Error();
    const client = new StatusListIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const statusListDid = DidStatusListRegister.create({
      controllers: [config.config.invite.id],
      length: statusListLength,
    });
    await DidStatusListRegister.save(statusListDid, client);
    return StatusListService.create(statusListDid, statusListServicePath);
  }

  it('create', async () => {
    if (!config.config.invite) throw new Error();
    const client = new StatusListIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const statusListDid = DidStatusListRegister.create({
      controllers: [config.config.invite.id],
    });
    const response = await DidStatusListRegister.save(statusListDid, client);
    expect(response).toBeDefined();
  });

  it('load', async () => {
    const statusListServicePath = './tmp/revocationListConfig.json';
    await createStatusListService(statusListServicePath);
    const statusListService = await StatusListService.load(
      statusListServicePath
    );
    expect(statusListService.did).toBeDefined();
  });

  it('persist', async () => {
    const statusListServicePath = './tmp/revocationListConfig.json';
    const statusListService = await createStatusListService(
      statusListServicePath
    );
    const client = new StatusListIssuerService(
      testValues.network.gateways,
      cryptoService
    );

    // Create new credential status
    const credentialStatus = await statusListService.getNewCredentialStatus();

    // Revoke credential
    await statusListService.setRevoked(credentialStatus, true);

    // Expect status list resolver to return credential as not revoked yet
    expect(
      await new DidStatusListResolver().isRevoked(credentialStatus)
    ).toEqual(false);

    // Persist status list
    await statusListService.persistStatusList(client);

    // Expect status list resolver to return credential as revoked now
    expect(
      await new DidStatusListResolver().isRevoked(credentialStatus)
    ).toEqual(true);
  }, 20000);

  it('revoke credentialStatus', async () => {
    const statusListServicePath = './tmp/revocationListConfig.json';
    const statusListService = await createStatusListService(
      statusListServicePath
    );
    const credentialStatus = await statusListService.getNewCredentialStatus();
    expect(credentialStatus.id).toBeDefined();

    // Expect credential not to be revoked
    expect(
      statusListService.did.isRevoked(credentialStatus.statusListIndex)
    ).toEqual(false);

    // Revoke credential
    await statusListService.setRevoked(credentialStatus, true);
    // Expect credential to be revoked
    expect(
      statusListService.did.isRevoked(credentialStatus.statusListIndex)
    ).toEqual(true);

    // Unrevoke credential
    await statusListService.setRevoked(credentialStatus, false);
    // Expect credential not to be revoked
    expect(
      statusListService.did.isRevoked(credentialStatus.statusListIndex)
    ).toEqual(false);
  });

  it('maximum size', async () => {
    const statusListServicePath = './tmp/revocationListConfig.json';
    const statusListLength = 10;
    const statusListService = await createStatusListService(
      statusListServicePath,
      statusListLength
    );

    // create maximum number of credential status
    for (let i = 0; i < statusListLength; i++) {
      const credentialStatus = await statusListService.getNewCredentialStatus();
      expect(credentialStatus.id).toBeDefined();
    }

    // expect list to be full now
    await expect(
      statusListService.getNewCredentialStatus()
    ).rejects.toThrowError('The revocation list is full!');
  });

  it('invalid revocation', async () => {
    const statusListServicePath = './tmp/revocationListConfig.json';
    const statusListLength = 10;
    const statusListService = await createStatusListService(
      statusListServicePath,
      statusListLength
    );
    let credentialStatus = await statusListService.getNewCredentialStatus();

    // Expect next free index not to be used yet
    credentialStatus.statusListIndex += 1;
    await expect(
      statusListService.setRevoked(credentialStatus, true)
    ).rejects.toThrowError('index is not used yet');

    credentialStatus = await statusListService.getNewCredentialStatus();

    // Expect next free index not to be used yet
    credentialStatus.statusListCredential = 'invalid credential';
    await expect(
      statusListService.setRevoked(credentialStatus, true)
    ).rejects.toThrowError(
      'Revocation list URL in credentialStatus does not equal this revocation list URL'
    );
  });
});
