import { SchemaResponse } from '@trustcerts/gateway';
import { DidCreation, Identifier } from '@trustcerts/did';
import { DidSchema } from '../resolve/did-schema';
import { SchemaIssuerService } from './schema-issuer-service';
export class DidSchemaRegister {
  /**
   * creates a fresh did with a unique identifier. Add controller when they are passed.
   *
   * @param values
   */
  public static create(values?: DidCreation): DidSchema {
    // TODO check if a given id should be allowed
    const id = values?.id ?? Identifier.generate(DidSchema.objectName);
    const did = new DidSchema(id);
    values?.controllers?.forEach((controller) => did.addController(controller));
    return did;
  }

  public static save(
    did: DidSchema,
    client: SchemaIssuerService
  ): Promise<SchemaResponse> {
    const value = did.getChanges();
    did.version++;
    did.resetChanges();
    return client.persist(value);
  }
}
