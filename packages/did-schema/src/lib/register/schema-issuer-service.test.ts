import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import { CryptoService, defaultCryptoKeyService } from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { DidSchemaRegister, SchemaIssuerService } from '@trustcerts/did-schema';
import { WalletService } from '@trustcerts/wallet';
import { readFileSync } from 'fs';

describe('test schema issuer service', () => {
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

  it('set wrong schema', () => {
    const did = DidSchemaRegister.create();
    did.setSchema({
      // TODO check what happens when schema is added
      // $schema: 'http://json-schema.org/draft-06/schema#',
      $ref: '#/definitions/Welhellocome',
      definitions: {
        Welcome: {
          type: 'object',
          additionalProperties: false,
          properties: {
            greeting: {
              type: 'string',
            },
            instructions: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          required: ['greeting', 'instructions'],
          title: 'Welcome',
        },
      },
    });
  });

  it('create schema', async () => {
    if (!config.config.invite) throw new Error();
    const client = new SchemaIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const did = DidSchemaRegister.create({
      controllers: [config.config.invite.id],
    });
    did.setSchema({ foo: 'bar' });
    const res = await DidSchemaRegister.save(did, client);
    expect(res).toBeDefined();
  }, 7000);
});
