import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import { CryptoService, defaultCryptoKeyService } from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { DidSchemaRegister, SchemaIssuerService } from '@trustcerts/did-schema';
import {
  DidTemplateRegister,
  DidTemplateResolver,
  TemplateIssuerService,
} from '@trustcerts/did-template';
import { CompressionType } from '@trustcerts/gateway';
import { WalletService } from '@trustcerts/wallet';
import { JSONSchemaType } from 'ajv';
import { readFileSync } from 'fs';

class Name {
  name!: string;
}

describe('test template service', () => {
  let config: ConfigService;
  let cryptoService: CryptoService;

  const schema: JSONSchemaType<Name> = {
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
    required: ['name'],
    additionalProperties: false,
  };

  const template = '<h1>Hello {{ name }}</h1>';

  const testValues = JSON.parse(readFileSync('./values.json', 'utf-8'));

  beforeAll(async () => {
    DidNetworks.add(testValues.network.namespace, testValues.network);
    DidNetworks.add('tc:staging', testValues.network);
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

  it('verifyTemp', async () => {
    console.log(
      await new DidTemplateResolver().load(
        'did:trust:tc:staging:tmp:FtcvRWqH6mTtkpCQN24rjT#%7B%22random%22%3A%22581b75a4dbf7375b4d6117584e2d841b%22%2C%22name%22%3A%22Markus%20Kuhn%22%2C%22skillbadge%22%3A%22Der%20Traditionsb%C3%BCrger%22%2C%22lernbegleiter%22%3A%22Zukunftsinstitut%22%2C%22datum%22%3A%222022-07-12T09%3A26%3A58.241Z%22%7D'
      )
    );
  });

  it('verify', async () => {
    if (!config.config.invite) throw new Error();
    const clientSchema = new SchemaIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const schemaDid = DidSchemaRegister.create({
      controllers: [config.config.invite.id],
    });
    schemaDid.setSchema(schema);
    await DidSchemaRegister.save(schemaDid, clientSchema);
    const client = new TemplateIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    const templateDid = DidTemplateRegister.create({
      controllers: [config.config.invite.id],
    });
    templateDid.schemaId = schemaDid.id;
    templateDid.template = template;
    templateDid.compression = {
      type: CompressionType.JSON,
    };
    await DidTemplateRegister.save(templateDid, client);
    const loadedTemplate = await new DidTemplateResolver().load(templateDid.id);

    expect(loadedTemplate.template).toEqual(template);
  });
});
