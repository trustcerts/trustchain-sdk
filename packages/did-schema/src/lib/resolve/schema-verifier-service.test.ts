import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import { CryptoService, defaultCryptoKeyService } from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import {
  DidSchemaRegister,
  DidSchemaResolver,
  SchemaIssuerService,
} from '@trustcerts/did-schema';
import { WalletService } from '@trustcerts/wallet';
import { readFileSync } from 'fs';

describe('test schema verifier service', () => {
  let config: ConfigService;

  let cryptoService: CryptoService;

  const testValues = JSON.parse(readFileSync('./values.json', 'utf-8'));

  beforeAll(async () => {
    DidNetworks.add(testValues.network.namespace, testValues.network);
    Identifier.setNetwork(testValues.network.namespace);
    config = new LocalConfigService(testValues.filePath);
    await config.init(testValues.configValues);

    const wallet = new WalletService(config);
    await wallet.init();

    cryptoService = new CryptoService();

    const key = (
      await wallet.findOrCreate(
        VerificationRelationshipType.assertionMethod,
        defaultCryptoKeyService.algorithm
      )
    )[0];
    await cryptoService.init(key);
  }, 10000);

  it('verify schema', async () => {
    if (!config.config.invite) throw new Error();
    const client = new SchemaIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const did = DidSchemaRegister.create({
      controllers: [config.config.invite.id],
    });
    const schema = { foo: 'bar' };
    did.setSchema(schema);
    const res = await DidSchemaRegister.save(did, client);
    expect(res).toBeDefined();

    const resolver = new DidSchemaResolver();
    const resolvedIdByTransactions = await resolver.load(did.id, {
      doc: false,
    });
    expect(resolvedIdByTransactions.getSchema()).toEqual(
      JSON.stringify(schema)
    );
    const resolvedIdByDoc = await resolver.load(did.id, { doc: true });
    expect(resolvedIdByDoc.getSchema()).toEqual(JSON.stringify(schema));
  }, 7000);
});
