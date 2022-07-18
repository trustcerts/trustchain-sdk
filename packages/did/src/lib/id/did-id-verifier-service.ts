import { DidIdStructure } from '@trustcerts/gateway';
import { logger } from '@trustcerts/logger';
import {
  AxiosError,
  Configuration,
  DidIdTransaction,
  DidObserverApi,
  IdDocResponse,
} from '@trustcerts/observer';
import { DidManagerConfigValues } from '../DidManagerConfigValues';
import { DidNetworks } from '../network/did-networks';
import { Network } from '../network/network';
import { VerifierService } from '../verifier-service';

export class DidIdVerifierService extends VerifierService {
  protected override apis!: DidObserverApi[];

  protected setEndpoints(id: string) {
    // resolve the network based on the did string
    const network: Network = DidNetworks.resolveNetwork(id);
    if (!network) {
      throw new Error(`no networks found for ${id}`);
    }
    this.apis = network.observers.map(
      (url) => new DidObserverApi(new Configuration({ basePath: url }))
    );
  }

  /**
   * Resolve a DID document by returning the first valid response of a observer of the network
   * @param id The DID of the DID document
   * @param config The config for the DID request
   * @param timeout Timeout for each observer that is queried
   * @returns The resolved DID document
   */
  async getDidDocument(
    id: string,
    config: DidManagerConfigValues<DidIdTransaction>
  ): Promise<IdDocResponse> {
    this.setEndpoints(id);
    for (const api of this.apis) {
      const res = await api
        .observerDidControllerGetDoc(id, config.time, undefined, {
          timeout: this.timeout,
        })
        .then(
          (res) =>
            this.validateDoc(res.data, config).then(
              // TODO check if this works
              () => res.data,
              (err) => logger.warn(err)
            ),
          (err: AxiosError) =>
            err.response
              ? logger.warn(`${id}: ${JSON.stringify(err.response.data)}`)
              : logger.warn(err)
        );
      if (res) return Promise.resolve(res);
    }
    return Promise.reject(`no did doc found for ${id}`);
  }

  /**
   * Resolve a DID document's transactions by returning the first valid response of a observer of the network
   * @param id The DID of the DID document
   * @param validate Whether to validate the response
   * @param time The time of the DID document that shall be queried
   * @param timeout Timeout for each observer that is queried
   * @returns The DID document's transactions
   */
  async getDidTransactions(
    id: string,
    validate = true,
    time: string
  ): Promise<DidIdTransaction[]> {
    this.setEndpoints(id);
    for (const api of this.apis) {
      const res = await api
        .observerDidControllerGetTransactions(id, time, undefined, {
          timeout: this.timeout,
        })
        .then(async (res) => {
          if (validate) {
            for (const transaction of res.data) {
              await this.validateTransaction(transaction);
            }
          }
          return Promise.resolve(res.data);
        })
        .catch(logger.warn);
      if (res) {
        return Promise.resolve(res);
      }
    }
    return Promise.reject('no transactions founds');
  }
}
