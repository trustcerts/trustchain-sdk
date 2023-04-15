import { ClaimIssuerService, ClaimVerifierService } from '@trustcerts/claim';
import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import { CryptoService, defaultCryptoKeyService } from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { SignatureIssuerService } from '@trustcerts/did-hash';
import { createClaim } from './claim-test-helpers';
import { WalletService } from '@trustcerts/wallet';
import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';

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

  it('create claim', async () => {
    const val = {
      random: randomBytes(16).toString('hex'),
      name: 'Max Mustermann',
    };
    const claim = await createClaim(val, cryptoService, config);
    expect(claim.values).toEqual(val);
    const service = new ClaimVerifierService('localhost');
    const claimLoaded = await service.get(
      claim.getUrl().split('/').slice(1).join('/')
    );
    const validation = claimLoaded.getValidation();
    if (!validation) throw new Error();
    expect(validation.revoked).toBeUndefined();
  }, 15000);

  it('revoke a claim', async () => {
    const value = {
      random: randomBytes(16).toString('hex'),
      name: 'Max Mustermann',
    };
    const claim = await createClaim(value, cryptoService, config);
    const claimIssuer = new ClaimIssuerService();
    const signatureIssuer = new SignatureIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    await claimIssuer.revoke(claim, signatureIssuer);
    const service = new ClaimVerifierService('localhost');
    const claimLoaded = await service.get(
      claim.getUrl().split('/').slice(1).join('/')
    );
    const validation = claimLoaded.getValidation();
    if (!validation) throw new Error();
    expect(validation.revoked).toBeDefined();
  }, 15000);

  it('create claim with invalid schema', async () => {
    // Schema expects 'random' and 'name', so we'll use 'fullName' instead of 'name' to use an invalid schema
    const val = {
      random: randomBytes(16).toString('hex'),
      fullName: 'Max Mustermann',
    };
    await expect(createClaim(val, cryptoService, config)).rejects.toThrowError(
      'input does not match with schema'
    );
  }, 15000);

  it('revoke a claim with invalid hash', async () => {
    const value = {
      random: randomBytes(16).toString('hex'),
      name: 'Max Mustermann',
    };
    const claim = await createClaim(value, cryptoService, config);
    const claimIssuer = new ClaimIssuerService();
    const signatureIssuer = new SignatureIssuerService(
      testValues.network.gateways,
      cryptoService
    );
    // Replace the content of ClaimValues with a random value so it results in an invalid hash
    claim.values['name'] = 'Not Max Mustermann' + new Date().getTime();
    await expect(
      claimIssuer.revoke(claim, signatureIssuer)
    ).rejects.toThrowError('hash of claim not found');
  }, 15000);

  it('create claim with invalid config invite', async () => {
    const value = {
      random: randomBytes(16).toString('hex'),
      name: 'Max Mustermann',
    };
    config.config.invite = undefined;
    await expect(
      createClaim(value, cryptoService, config)
    ).rejects.toThrowError();
  }, 15000);
});
