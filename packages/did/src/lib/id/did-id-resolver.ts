import { DidIdStructure } from '@trustcerts/gateway';
import { logger } from '@trustcerts/logger';
import { DidResolver } from '../did-resolver';
import { InitDidManagerConfigValues } from '../InitDidManagerConfigValues';
import { DidId } from './did-id';
import { DidIdVerifierService } from './did-id-verifier-service';

export class DidIdResolver extends DidResolver<DidIdVerifierService> {
  constructor() {
    super();
    this.verifier = new DidIdVerifierService();
  }

  public async load(
    id: string,
    values?: InitDidManagerConfigValues<DidIdStructure>
  ): Promise<DidId> {
    const didID = id.split('#')[0];
    const config = this.setConfig<DidIdStructure>(values);
    const did = new DidId(didID);
    await this.loadDid(did, config);
    return did;
  }
}
