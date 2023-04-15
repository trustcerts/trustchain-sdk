import { Did } from '@trustcerts/did';
import {
  DidSchemaDocument,
  DidSchemaStructure,
  SchemaDocResponse,
} from '@trustcerts/observer';
import Ajv, { AnySchema } from 'ajv';

export class DidSchema extends Did {
  static objectName = 'sch';

  private schema!: string;
  private ajv: Ajv;

  constructor(public override id: string) {
    super(id, DidSchema.objectName, 22);
    // if the passed id value already has a prefix remove it.
    // TODO set correct regexp, normal did should have no type
    // TODO use method from Identifier.method
    this.ajv = new Ajv({ allErrors: true });
  }

  async parseTransactions(transactions: DidSchemaStructure[]): Promise<void> {
    for (const transaction of transactions) {
      this.version++;
      // validate signature of transaction
      // parse it into the existing document
      this.parseTransactionControllers(transaction);

      this.schema = transaction.schema ?? this.schema;
    }
  }
  async parseDocument(docResponse: SchemaDocResponse): Promise<void> {
    this.parseDocumentSuper(docResponse);
    this.schema = docResponse.document.value ?? this.schema;
  }

  resetChanges(): void {
    this.schema = '';
  }

  getDocument(): DidSchemaDocument {
    return {
      '@context': this['@context'],
      id: this.id,
      controller: Array.from(this.controller.current.values()),
      value: this.schema,
    };
  }

  setSchema(schema: AnySchema) {
    if (!this.ajv.validateSchema(schema, true)) {
      throw Error('schema not valid');
    }
    this.schema = JSON.stringify(schema);
  }

  getSchema() {
    return this.schema;
  }

  getChanges(): DidSchemaStructure {
    // TODO maybe throw an error if the changes are requested, but the version is 0 so there is no did to update.
    const changes = this.getBasicChanges<DidSchemaStructure>();
    changes.schema = this.schema;
    return changes;
  }
}
