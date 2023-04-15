import { ClaimValues, ClaimVerifierService } from '@trustcerts/claim';
import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import { CryptoService, defaultCryptoKeyService } from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { createClaim } from './claim-test-helpers';
import { WalletService } from '@trustcerts/wallet';
import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { DidSchema } from '@trustcerts/did-schema';
import { DidHashResolver } from '@trustcerts/did-hash';

/**
 * Test claim class.
 */
describe('claim', () => {
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
    // TODO put this in an extra function
    // get a key for assertion and a specific type
    const key = (
      await wallet.findOrCreate(
        VerificationRelationshipType.assertionMethod,
        defaultCryptoKeyService.algorithm
      )
    )[0];
    // init crypto service for assertion
    await cryptoService.init(key);
  }, 10000);

  it('read a claim', async () => {
    const claimValues: ClaimValues = {
      random: randomBytes(16).toString('hex'),
      name: 'Max Mustermann',
    };

    const claim = await createClaim(claimValues, cryptoService, config);
    expect(claim.values).toEqual(claimValues);
    const service = new ClaimVerifierService('localhost');
    const claimLoaded = await service.get(
      claim.getUrl().split('/').slice(1).join('/')
    );
    const validation = claimLoaded.getValidation();
    if (!validation) throw Error();
    expect(validation.revoked).toBeUndefined();
    expect(claim.getUrl()).toEqual(claimLoaded.getUrl());
    expect(await claim.getHtml()).toEqual(await claimLoaded.getHtml());
    expect(claim.values).toEqual(claimLoaded.values);
  }, 20000);

  it('read a claim with invalid schema', async () => {
    const claimValues: ClaimValues = {
      random: randomBytes(16).toString('hex'),
      name: 'Max Mustermann',
    };
    const claim = await createClaim(claimValues, cryptoService, config);

    expect(claim.values).toEqual(claimValues);

    // Mock DidSchema.getSchema() so the schema validation will fail
    jest.spyOn(DidSchema.prototype, 'getSchema').mockReturnValueOnce(
      JSON.stringify({
        type: 'object',
        properties: {
          thisIsADifferentProperty: { type: 'string' },
        },
        required: ['thisIsADifferentProperty'],
        additionalProperties: false,
      })
    );

    const service = new ClaimVerifierService('localhost');
    await expect(
      service.get(claim.getUrl().split('/').slice(1).join('/'))
    ).rejects.toThrowError('values do not match with schema');
  }, 20000);

  it('read a claim with invalid hash', async () => {
    const claimValues: ClaimValues = {
      random: randomBytes(16).toString('hex'),
      name: 'Max Mustermann',
    };
    const claim = await createClaim(claimValues, cryptoService, config);

    expect(claim.values).toEqual(claimValues);

    // Mock DidHashResolver.load() so the claim hash verification will fail
    jest
      .spyOn(DidHashResolver.prototype, 'load')
      .mockRejectedValueOnce('mockError');

    const service = new ClaimVerifierService('localhost');
    await expect(
      service.get(claim.getUrl().split('/').slice(1).join('/'))
    ).rejects.toThrowError('failed to verify');
  }, 20000);

  it('get hash', async () => {
    const claimValues: ClaimValues = {
      random: 'f43747fbc64627d6e86025d026abc878',
      name: 'Max Mustermann',
      yearOfBirth: 1980,
    };
    const templateDid = 'templateDid';
    const expectedHash = '7wdvE7i9YKyWw7cDK1jU89fDPgZPwrtLsW2XnochxwjR';

    const hash = await ClaimVerifierService.getHash(claimValues, templateDid);
    expect(hash).toEqual(expectedHash);
  }, 15000);
});
