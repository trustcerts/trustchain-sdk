import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import { CryptoService, defaultCryptoKeyService } from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { WalletService } from '@trustcerts/wallet';
import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { PDFDocument } from 'pdf-lib';
import { Claim } from './claim';
import { createClaim } from './claim-test-helpers';
import globalAxios from 'axios';

describe('test claim.ts', () => {
  let config: ConfigService;

  let cryptoService: CryptoService;

  const testValues = JSON.parse(readFileSync('./values.json', 'utf-8'));

  let claim: Claim;

  beforeAll(async () => {
    DidNetworks.add(testValues.network.namespace, testValues.network);
    Identifier.setNetwork(testValues.network.namespace);
    config = new LocalConfigService(testValues.filePath);
    await config.init(testValues.configValues);

    const wallet = new WalletService(config);
    await wallet.init();

    cryptoService = new CryptoService();
    // TODO put this in an extra function
    // get a key for assertion and a specific type
    const key = (
      await wallet.findOrCreate(
        VerificationRelationshipType.assertionMethod,
        defaultCryptoKeyService.keyType
      )
    )[0];
    // init crypto service for assertion
    await cryptoService.init(key);

    const val = {
      random: 'f43747fbc64627d6e86025d026abc878',
      name: 'Max Mustermann',
    };
    claim = await createClaim(val, cryptoService, config);
  }, 10000);
  it('getTemplateId', async () => {
    const templateId = claim.getTemplateId();
    expect(templateId).toBeDefined();
  }, 15000);
  it('getUrl', async () => {
    const url = claim.getUrl();
    console.log(url);
    expect(url).toBeDefined();
  }, 15000);
  it('getHtml', async () => {
    const html = await claim.getHtml();
    expect(html).toEqual('<h1>Hello Max Mustermann</h1>');
  }, 15000);
  it('getPdf', async () => {
    // TODO: test getPdf()
  }, 15000);
  it('fillParagraph', async () => {
    // TODO: test fillParagraph()
  }, 15000);
  it('setValidation', async () => {
    // TODO: test setValidation() and getValidation()
  }, 15000);
});
