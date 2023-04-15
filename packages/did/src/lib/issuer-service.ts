import { Configuration, BaseAPI } from '@trustcerts/gateway';
import { CryptoService } from '@trustcerts/crypto';
import { DidStructure } from '@trustcerts/observer';

/**
 * Service to sign files.
 */
export abstract class IssuerService {
  protected api!: BaseAPI;

  protected apiConfiguration: Configuration;

  constructor(
    gateways: string[],
    protected readonly cryptoService: CryptoService,
    private defaultDelay = 2000
  ) {
    // TODO check if keypair exists and init the crypto service with it
    this.apiConfiguration = new Configuration({
      basePath: gateways[0],
    });
  }

  // TODO set PersistedResponse as response
  /**
   * Persists the transaction for a did object
   * @param value
   */
  abstract persist(value: DidStructure): Promise<any>;

  /**
   * Returns the identifier of the user.
   */
  public getId(): string {
    return this.cryptoService.fingerPrint.split('#')[0];
  }

  /**
   * Wait some time to give the network time to sync the transactions. Since the issuer only receives a positive signal from a gateway it is not guranteed that the observers have already persisted the information.
   */
  protected delay() {
    return new Promise((res) => setTimeout(res, this.defaultDelay));
  }
}
