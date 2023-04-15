import { DidResolver, InitDidManagerConfigValues } from '@trustcerts/did';
import { DidSchemaStructure } from '@trustcerts/gateway';
import { DidSchema } from './did-schema';
import { SchemaVerifierService } from './schema-verifier-service';

export class DidSchemaResolver extends DidResolver<SchemaVerifierService> {
  constructor() {
    super();
    this.verifier = new SchemaVerifierService();
  }

  public async load(
    id: string,
    values?: InitDidManagerConfigValues<DidSchemaStructure>
  ): Promise<DidSchema> {
    const didID = id.split('#')[0];
    const config = this.setConfig<DidSchemaStructure>(values);
    const did = new DidSchema(didID);
    await this.loadDid(did, config);
    return did;
  }
}
