import { Configuration, BaseAPI } from '@trustcerts/gateway';
import { CryptoService } from '@trustcerts/crypto';

/**
 * Service to sign files.
 */
export abstract class IssuerService {
  protected api!: BaseAPI;

  protected apiConfiguration: Configuration;

  constructor(
    gateways: string[],
    protected readonly cryptoService: CryptoService
  ) {
    // TODO check if keypair exists and init the crypto service with it
    this.apiConfiguration = new Configuration({
      basePath: gateways[0],
    });
  }

  /**
   * Returns the identifier of the user.
   */
  public getId(): string {
    return this.cryptoService.fingerPrint.split('#')[0];
  }
}
