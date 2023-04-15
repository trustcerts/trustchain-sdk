import {
  DidManagerConfigValues,
  DidNetworks,
  Network,
  VerifierService,
} from '@trustcerts/did';
import { logger } from '@trustcerts/logger';
import {
  AxiosError,
  Configuration,
  DidTemplateTransaction,
  TemplateDocResponse,
  TemplateObserverApi,
  DidTemplateStructure,
} from '@trustcerts/observer';

export class TemplateVerifierService extends VerifierService {
  protected override apis!: TemplateObserverApi[];

  protected setEndpoints(id: string) {
    // resolve the network based on the did string
    const network: Network = DidNetworks.resolveNetwork(id);
    if (!network) {
      throw new Error(`no networks found for ${id}`);
    }
    this.apis = network.observers.map(
      (url) => new TemplateObserverApi(new Configuration({ basePath: url }))
    );
  }

  /**
   * Resolve a DID document by returning the first valid response of a observer of the network
   *
   * @param id The DID of the DID document
   * @param config The config for the DID request
   * @param timeout Timeout for each observer that is queried
   * @returns The resolved DID document
   */
  async getDidDocument(
    id: string,
    config: DidManagerConfigValues<DidTemplateTransaction>
  ): Promise<TemplateDocResponse> {
    this.setEndpoints(id);
    for (const api of this.apis) {
      const res = await api
        .observerTemplateControllerGetDoc(id, config.time, undefined, {
          timeout: this.timeout,
        })
        .then(
          async (res) =>
            await this.validateDoc(res.data, config).then(
              () => res.data,
              (err) => logger.warn(err)
            ),
          (err: AxiosError) => {
            err.response ? logger.warn(err.response.data) : logger.warn(err);
          }
        );
      if (res) return Promise.resolve(res);
    }
    return Promise.reject('no did doc found');
  }

  /**
   * Resolve a DID document's transactions by returning the first valid response of a observer of the network
   *
   * @param id The DID of the DID document
   * @param validate Whether to validate the response
   * @param time The time of the DID document that shall be queried
   * @param timeout Timeout for each observer that is queried
   * @returns The DID document's transactions
   */
  async getDidTransactions(
    id: string,
    validate: boolean,
    time: string
  ): Promise<DidTemplateStructure[]> {
    this.setEndpoints(id);
    for (const api of this.apis) {
      const res = await api
        .observerTemplateControllerGetTransactions(id, time, undefined, {
          timeout: this.timeout,
        })
        .then(async (res) => {
          if (validate) {
            for (const transaction of res.data) {
              await this.validateTransaction(transaction);
            }
          }
          return res.data.map((transaction) => transaction.values);
        })
        .catch(logger.warn);
      if (res) return Promise.resolve(res);
    }
    return Promise.reject('no transactions found');
  }
}
