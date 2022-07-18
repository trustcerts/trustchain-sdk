import { Did } from '@trustcerts/did';
import {
  Compression,
  DidTemplateDocument,
  DidTemplateStructure,
  DidTemplateTransaction,
  TemplateDocResponse,
} from '@trustcerts/observer';

export class DidTemplate extends Did {
  // use setters to change values to detect if there where changes
  public compression!: Compression;

  public template!: string;

  public schemaId!: string;

  parseTransactions(transactions: DidTemplateTransaction[]): void {
    // this.values.
    for (const transaction of transactions) {
      this.version++;
      // validate signature of transaction
      // parse it into the existing document
      this.parseTransactionControllers(transaction);

      this.schemaId = transaction.values.schemaId ?? this.schemaId;
      this.template = transaction.values.template ?? this.template;
      this.compression = transaction.values.compression ?? this.compression;
    }
  }
  parseDocument(docResponse: TemplateDocResponse): void {
    this.parseDocumentSuper(docResponse);
    this.schemaId = docResponse.document.schemaId;
    this.template = docResponse.document.template;
    this.compression = docResponse.document.compression;
  }

  getDocument(): DidTemplateDocument {
    return {
      '@context': this.context,
      id: this.id,
      controller: Array.from(this.controller.current.values()),
      compression: this.compression,
      template: this.template,
      schemaId: this.schemaId,
    };
  }
  resetChanges(): void {
    // TODO implement
  }

  getChanges(): DidTemplateStructure {
    const changes = this.getBasicChanges<DidTemplateStructure>();
    changes.compression = this.compression;
    changes.schemaId = this.schemaId;
    changes.template = this.template;
    return changes;
  }
}
