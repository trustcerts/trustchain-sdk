import { DidResolver, InitDidManagerConfigValues } from '@trustcerts/did';
import { DidTemplateStructure } from '@trustcerts/observer';
import { DidTemplate } from './did-template';
import { TemplateVerifierService } from './template-verifier-service';

export class DidTemplateResolver extends DidResolver<TemplateVerifierService> {
  constructor() {
    super();
    this.verifier = new TemplateVerifierService();
  }

  public async load(
    id: string,
    values?: InitDidManagerConfigValues<DidTemplateStructure>
  ): Promise<DidTemplate> {
    const didID = id.split('#')[0];
    const config = this.setConfig<DidTemplateStructure>(values);
    const did = new DidTemplate(didID);
    await this.loadDid(did, config);
    return did;
  }
}
