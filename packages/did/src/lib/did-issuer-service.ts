import { CryptoService, sortKeys } from '@trustcerts/crypto';
import {
  DidGatewayApi,
  DidIdTransactionDto,
  TransactionType,
  AxiosError,
  SignatureType,
  DidIdStructure,
} from '@trustcerts/gateway';
import { IssuerService } from './issuer-service';
import { SignatureContent } from './verifier-service';
export class DidIdIssuerService extends IssuerService {
  protected override api: DidGatewayApi;

  constructor(gateways: string[], cryptoService: CryptoService) {
    super(gateways, cryptoService);
    this.api = new DidGatewayApi(this.apiConfiguration);
  }

  async persist(value: DidIdStructure): Promise<void> {
    const transaction: DidIdTransactionDto = {
      version: 1,
      body: {
        date: new Date().toISOString(),
        value,
        type: TransactionType.Did,
        version: 1,
      },
      metadata: {
        version: 1,
      },
      signature: {
        type: SignatureType.Single,
        values: [],
      },
    };
    const content: SignatureContent = {
      date: transaction.body.date,
      type: transaction.body.type,
      value: transaction.body.value,
    };
    transaction.signature.values.push({
      signature: await this.cryptoService.sign(
        JSON.stringify(sortKeys(content))
      ),
      identifier: this.cryptoService.fingerPrint,
    });

    return this.api.gatewayDidControllerStore(transaction).then(
      (res) => this.delay().then(() => res.data),
      (err: AxiosError) => {
        if (err.response) {
          return Promise.reject(err.response.data);
        } else {
          return Promise.reject(err);
        }
      }
    );
  }
}
