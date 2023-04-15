import { read, write } from '@trustcerts/helpers';
import { IStatusListService } from '@trustcerts/vc';
import { DidStatusList } from '../resolver/did-status-list';
import { DidStatusListResolver } from '../resolver/did-status-list-resolver';
import { DidStatusListRegister } from './did-status-list-register';
import { ICredentialStatus, IStatusListConfig } from './revocation.interface';
import { StatusListIssuerService } from './status-list-issuer-service';

export class StatusListService implements IStatusListService {
  private statusListConfig!: IStatusListConfig;

  static create(did: DidStatusList, path: string) {
    const config: IStatusListConfig = {
      id: did.id,
      length: did.getLength(),
      nextIndex: 0,
    };
    write(path, JSON.stringify(config));
    return new StatusListService(path, did);
  }

  static async load(path: string) {
    const statusListConfig = JSON.parse(read(path));
    const did = await new DidStatusListResolver().load(statusListConfig.id);
    return new StatusListService(path, did);
  }

  /**
   *
   * @param revocationListConfigPath
   * @param did
   */
  constructor(
    private revocationListConfigPath: string,
    public did: DidStatusList
  ) {
    this.statusListConfig = JSON.parse(read(this.revocationListConfigPath));
  }

  private isRevocationListFull(): boolean {
    return this.statusListConfig.nextIndex >= this.statusListConfig.length;
  }

  private getNextFreeIndex(): number {
    if (this.isRevocationListFull()) {
      // TODO: handle this case
      throw Error('The revocation list is full!');
    }
    const nextFreeIndex = this.statusListConfig.nextIndex;
    this.statusListConfig.nextIndex += 1;
    write(
      this.revocationListConfigPath,
      JSON.stringify(this.statusListConfig, null, 4)
    );
    return nextFreeIndex;
  }

  /**
   * Creates a new unrevoked credential status with the next free index on the revocation list
   *
   * @returns The credential status
   */
  public async getNewCredentialStatus(): Promise<ICredentialStatus> {
    const index = this.getNextFreeIndex();
    return {
      id: `${this.statusListConfig.id}#${index}`,
      type: 'StatusList2021Entry',
      statusListCredential: this.statusListConfig.id,
      statusListIndex: index,
    };
  }

  /**
   * Revokes or unrevokes a given credential status
   *
   * @param did
   * @param credentialStatus The credential status to (un-)revoke
   * @param revoked The revocation status to set it to
   */
  public async setRevoked(
    credentialStatus: ICredentialStatus,
    revoked: boolean
  ): Promise<void> {
    if (credentialStatus.statusListCredential != this.statusListConfig.id) {
      // TODO: Handling mehrerer URLs?
      throw Error(
        'Revocation list URL in credentialStatus does not equal this revocation list URL'
      );
    }
    const index = Number(credentialStatus.statusListIndex);
    // TODO if the index should be flipped but the type is revocation and not suspension, an error should be thrown
    if (index >= this.statusListConfig.nextIndex) {
      throw Error('index is not used yet');
    }
    this.did.setRevoked(index, revoked);
  }

  /**
   * Saves the changes of the status list.
   *
   * @param client
   */
  async persistStatusList(client: StatusListIssuerService) {
    return await DidStatusListRegister.save(this.did, client);
  }
}
