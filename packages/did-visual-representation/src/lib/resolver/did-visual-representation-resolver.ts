import { DidResolver, InitDidManagerConfigValues } from '@trustcerts/did';
import { DidVisualRepresentationStructure } from '@trustcerts/observer';
import { DidVisualRepresentation } from './did-visual-representation';
import { VisualRepresentationVerifierService } from './visual-representation-verifier-service';

export class DidVisualRepresentationResolver extends DidResolver<VisualRepresentationVerifierService> {
  constructor() {
    super();
    this.verifier = new VisualRepresentationVerifierService();
  }

  public async load(
    id: string,
    values?: InitDidManagerConfigValues<DidVisualRepresentationStructure>
  ): Promise<DidVisualRepresentation> {
    const didID = id.split('#')[0];
    const config = this.setConfig<DidVisualRepresentationStructure>(values);
    const did = new DidVisualRepresentation(didID);
    await this.loadDid(did, config);
    return did;
  }
}
