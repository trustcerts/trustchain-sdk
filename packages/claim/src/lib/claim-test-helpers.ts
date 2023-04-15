import { ConfigService } from '@trustcerts/config';
import { CryptoService } from '@trustcerts/crypto';
import { SignatureIssuerService } from '@trustcerts/did-hash';
import { SchemaIssuerService, DidSchemaRegister } from '@trustcerts/did-schema';
import {
  TemplateIssuerService,
  DidTemplateRegister,
} from '@trustcerts/did-template';
import { CompressionType } from '@trustcerts/gateway';
import { readFileSync } from 'fs';
import { Claim } from './claim';
import { ClaimIssuerService } from './claim-issuer-service';
import { ClaimValues } from './claim-values';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    random: { type: 'string' },
  },
  required: ['name', 'random'],
  additionalProperties: false,
};

const testValues = JSON.parse(readFileSync('./values.json', 'utf-8'));

/**
 *
 * @param val
 * @param cryptoService
 * @param config
 */
export async function createClaim(
  val: ClaimValues,
  cryptoService: CryptoService,
  config: ConfigService
): Promise<Claim> {
  if (!config.config.invite) throw new Error();
  const template = '<h1>Hello {{ name }}</h1>';
  const host = 'localhost';

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
  const claimIssuer = new ClaimIssuerService();
  const signatureIssuer = new SignatureIssuerService(
    testValues.network.gateways,
    cryptoService
  );
  return claimIssuer.create(templateDid, val, host, signatureIssuer, [
    config.config.invite.id,
  ]);
}
