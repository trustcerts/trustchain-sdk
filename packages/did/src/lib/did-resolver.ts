import { DidStructure, DidTransaction } from '@trustcerts/observer';
import { DidCachedService } from './cache/did-cached-service';
import { Did } from './did';
import { DidManagerConfigValues } from './DidManagerConfigValues';
import { InitDidManagerConfigValues } from './InitDidManagerConfigValues';
import { VerifierService } from './verifier-service';

export abstract class DidResolver<T extends VerifierService> {
  protected verifier!: T;

  protected async loadDid(
    did: Did,
    // TODO any is not the best type
    config: DidManagerConfigValues<DidTransaction>
  ): Promise<void> {
    if (config.transactions?.length > 0) {
      did.parseTransactions(config.transactions);
    } else {
      console.log(config.doc);
      if (config.doc) {
        const document = await this.verifier
          .getDidDocument(did.id, config)
          .catch((err: Error) => {
            throw new Error(`Could not resolve DID: ${err} (${did.id})`);
          });
        did.parseDocument(document);
      } else {
        config.transactions = await this.verifier
          .getDidTransactions(did.id, config.validateChainOfTrust, config.time)
          .catch((err: Error) => {
            throw new Error(`Could not resolve DID: ${err} (${did.id})`);
          });
        did.parseTransactions(config.transactions);
      }
    }

    // TODO also add the version number and more information from the metadata that the cache needs to find suitable cached entries
    DidCachedService.add(did, config.time);
  }

  protected setConfig<T extends DidTransaction>(
    values?: InitDidManagerConfigValues<T>
  ): DidManagerConfigValues<T> {
    return {
      validateChainOfTrust: values?.validateChainOfTrust ?? true,
      // TODO check if empty array is correct
      transactions: values?.transactions ?? [],
      time: values?.time ?? new Date().toISOString(),
      version: values?.version ?? undefined,
      doc: values?.doc ?? true,
    };
  }

  abstract load(
    id: string,
    values?: InitDidManagerConfigValues<unknown>
  ): Promise<Did>;
}
