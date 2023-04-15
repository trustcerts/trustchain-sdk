import { Did } from '@trustcerts/did';
import { DidStatusListStructure, StatusPurpose } from '@trustcerts/gateway';
import {
  DidStatusListDocument,
  StatusListDocResponse,
} from '@trustcerts/observer';
import { Bitstring } from './bit-string';

export class DidStatusList extends Did {
  static objectName = 'statuslist';

  statusPurpose!: StatusPurpose;

  private list!: Bitstring;

  constructor(public override id: string, private length?: number) {
    super(id, DidStatusList.objectName, 22);
    if (length) {
      this.list = new Bitstring({ length: this.length });
    }
    this.statusPurpose = StatusPurpose.revocation;
  }

  async parseTransactions(
    transactions: DidStatusListStructure[]
  ): Promise<void> {
    let encodedList: string | undefined;
    for (const transaction of transactions) {
      this.version++;
      // validate signature of transaction
      // parse it into the existing document
      this.parseTransactionControllers(transaction);
    }
    const lastTransaction = transactions.at(-1);
    if (lastTransaction) {
      this.statusPurpose = lastTransaction.statusPurpose ?? this.statusPurpose;
      encodedList = lastTransaction.encodedList;
    }
    if (!encodedList) throw new Error();
    this.initBitstring(encodedList);
  }

  async parseDocument(docResponse: StatusListDocResponse): Promise<void> {
    this.parseDocumentSuper(docResponse);
    this.statusPurpose = docResponse.document.statusPurpose;
    this.initBitstring(docResponse.document.encodedList);
  }

  private initBitstring(encodedList: string) {
    const buffer = Bitstring.decodeBits(encodedList);
    this.list = new Bitstring({ buffer });
  }

  getLength() {
    return this.list.length;
  }

  getDocument(): DidStatusListDocument {
    return {
      '@context': this['@context'],
      id: this.id,
      controller: Array.from(this.controller.current.values()),
      statusPurpose: this.statusPurpose,
      encodedList: this.list.encodeBits(),
    };
  }
  resetChanges(): void {
    // TODO implement
  }

  async getChanges(): Promise<DidStatusListStructure> {
    const changes = this.getBasicChanges<DidStatusListStructure>();
    changes.statusPurpose = this.statusPurpose;
    changes.encodedList = await this.list.encodeBits();
    return changes;
  }

  /**
   * Revokes or unrevokes a given credential status
   *
   * @param position
   * @param revoked The revocation status to set it to
   */
  public setRevoked(position: number, revoked = true) {
    this.list.set(position, revoked);
  }

  /**
   * Checks if the positon is revoked
   *
   * @param position
   * @returns
   */
  public isRevoked(position: number) {
    return this.list.get(position);
  }
}
