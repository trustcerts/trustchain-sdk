import { CryptoService, sortKeys } from '@trustcerts/crypto';
import { SignatureContent, IssuerService } from '@trustcerts/did';
import {
  StatuslistGatewayApi,
  DidStatusListStructure,
  AxiosError,
  StatusListResponse,
  SignatureType,
  StatusListTransactionDto,
  TransactionType,
} from '@trustcerts/gateway';

export class StatusListIssuerService extends IssuerService {
  protected override api: StatuslistGatewayApi;

  constructor(gateways: string[], cryptoService: CryptoService) {
    super(gateways, cryptoService);
    this.api = new StatuslistGatewayApi(this.apiConfiguration);
  }

  async persist(value: DidStatusListStructure): Promise<StatusListResponse> {
    const transaction: StatusListTransactionDto = {
      version: 1,
      metadata: {
        version: 1,
      },
      body: {
        version: 1,
        date: new Date().toISOString(),
        type: TransactionType.StatusList,
        value,
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
    return this.api.gatewayStatusListControllerCreate(transaction).then(
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
