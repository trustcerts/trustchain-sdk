import { CryptoService, sortKeys } from '@trustcerts/crypto';
import { SignatureContent, IssuerService } from '@trustcerts/did';
import {
  VisualRepresentationGatewayApi,
  DidVisualRepresentationStructure,
  AxiosError,
  VisualRepresentationResponse,
  SignatureType,
  VisualRepresentationTransactionDto,
  TransactionType,
} from '@trustcerts/gateway';

export class VisualRepresentationIssuerService extends IssuerService {
  protected override api: VisualRepresentationGatewayApi;

  constructor(gateways: string[], cryptoService: CryptoService) {
    super(gateways, cryptoService);
    this.api = new VisualRepresentationGatewayApi(this.apiConfiguration);
  }

  async persist(
    value: DidVisualRepresentationStructure
  ): Promise<VisualRepresentationResponse> {
    const transaction: VisualRepresentationTransactionDto = {
      version: 1,
      metadata: {
        version: 1,
      },
      body: {
        version: 1,
        date: new Date().toISOString(),
        type: TransactionType.VisualRepresentation,
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
    return await this.api
      .gatewayVisualRepresentationControllerCreate(transaction)
      .then(
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
