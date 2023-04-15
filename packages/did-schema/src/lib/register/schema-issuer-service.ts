import {
  AxiosError,
  SchemaGatewayApi,
  SchemaResponse,
  SchemaTransactionDto,
  SignatureType,
  TransactionType,
} from '@trustcerts/gateway';
import { DidSchemaStructure } from '@trustcerts/observer';
import { CryptoService, sortKeys } from '@trustcerts/crypto';
import { SignatureContent, IssuerService } from '@trustcerts/did';

export class SchemaIssuerService extends IssuerService {
  protected override api: SchemaGatewayApi;

  constructor(gateways: string[], cryptoService: CryptoService) {
    super(gateways, cryptoService);
    this.api = new SchemaGatewayApi(this.apiConfiguration);
  }

  async persist(value: DidSchemaStructure): Promise<SchemaResponse> {
    // TODO outsource this to the issuer service since the transaction schema of dids are equal
    const transaction: SchemaTransactionDto = {
      version: 1,
      body: {
        date: new Date().toISOString(),
        value,
        type: TransactionType.Schema,
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

    return this.api.gatewaySchemaControllerCreate(transaction).then(
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
