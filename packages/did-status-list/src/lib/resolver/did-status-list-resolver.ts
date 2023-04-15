import { DidResolver, InitDidManagerConfigValues } from '@trustcerts/did';
import { DidStatusListStructure } from '@trustcerts/observer';
import { ICredentialStatus } from '../register/revocation.interface';
import { DidStatusList } from './did-status-list';
import { StatusListVerifierService } from './status-list-verifier-service';

export class DidStatusListResolver extends DidResolver<StatusListVerifierService> {
  constructor() {
    super();
    this.verifier = new StatusListVerifierService();
  }

  public async load(
    id: string,
    values?: InitDidManagerConfigValues<DidStatusListStructure>
  ): Promise<DidStatusList> {
    const didID = id.split('#')[0];
    const config = this.setConfig<DidStatusListStructure>(values);
    const did = new DidStatusList(didID);
    await this.loadDid(did, config);
    return did;
  }

  async isRevoked(credentialStatus: ICredentialStatus): Promise<boolean> {
    // load list
    const did = await this.load(credentialStatus.id);
    return did.isRevoked(credentialStatus.statusListIndex);
  }
}
