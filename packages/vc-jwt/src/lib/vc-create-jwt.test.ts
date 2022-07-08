import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import {
  CryptoService,
  RSACryptoKeyService,
  ECCryptoKeyService,
} from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { logger } from '@trustcerts/logger';
import { JWT, VerifiableCredentialIssuerService } from '@trustcerts/vc-jwt';
import { WalletService } from '@trustcerts/wallet';
import { readFileSync } from 'fs';

/**
 * Test vc class.
 */
describe('vc', () => {
  let config: ConfigService;

  let cryptoServiceRSA: CryptoService;

  let cryptoServiceEC: CryptoService;

  let walletService: WalletService;

  const vcIssuerService = new VerifiableCredentialIssuerService();

  beforeAll(async () => {
    const testValues = JSON.parse(readFileSync('./values.json', 'utf-8'));

    DidNetworks.add(testValues.network.namespace, testValues.network);
    Identifier.setNetwork(testValues.network.namespace);
    config = new LocalConfigService(testValues.filePath);
    await config.init(testValues.configValues);

    const rsaCryptoKeyService = new RSACryptoKeyService();
    const ecCryptoKeyService = new ECCryptoKeyService();

    walletService = new WalletService(config, [
      rsaCryptoKeyService,
      ecCryptoKeyService,
    ]);
    await walletService.init();

    cryptoServiceRSA = new CryptoService();

    const rsaKey = (
      await walletService.findOrCreate(
        VerificationRelationshipType.assertionMethod,
        rsaCryptoKeyService.keyType
      )
    )[0];
    if (rsaKey !== undefined) {
      await cryptoServiceRSA.init(rsaKey);
    }

    cryptoServiceEC = new CryptoService();
    const ecKey = (
      await walletService.findOrCreate(
        VerificationRelationshipType.assertionMethod,
        ecCryptoKeyService.keyType
      )
    )[0];
    if (ecKey !== undefined) {
      await cryptoServiceEC.init(ecKey);
    }
  }, 10000);

  /**
   * Creates an example JWT-encoded verifiable credential for testing
   * @returns A JWT-encoded verifiable credential with example data
   */
  async function createVc(): Promise<string> {
    if (!config.config.invite) throw Error();

    return await vcIssuerService.createVerifiableCredential(
      {
        '@context': [],
        type: ['TestCredential'],
        credentialSubject: { id: 'did:max:mustermann' },
        id: 'unique_id',
        issuer: config.config.invite.id,
        // nonce: 'randomVC',
      },
      cryptoServiceRSA
    );
  }

  /**
   * Creates an example JWT-encoded verifiable presentation for testing
   * @returns A JWT-encoded verifiable presentation with example data
   */
  async function createVp(): Promise<string> {
    const vc1 = await createVc();
    const vc2 = await createVc();
    return await vcIssuerService.createVerifiablePresentation(
      {
        '@context': [],
        type: ['TestPresentation'],
        verifiableCredentials: [vc1, vc2],
        domain: 'domain',
        challenge: 'challenge',
        holder: 'did:max:mustermann',
        nonce: 'randomVP',
      },
      cryptoServiceRSA
    );
  }

  it('create vc', async () => {
    const vc = await createVc();
    logger.debug(vc);
    expect(vc).toBeDefined();
  }, 15000);

  // it('create invalid vc', async () => {
  //   if (!config.config.invite) throw Error();

  //   jest
  //     .spyOn(cryptoServiceRSA.keyPair.privateKey, 'algorithm', 'get')
  //     .mockReturnValue(null);

  //   return await vcIssuerService.createVerifiableCredential(
  //     {
  //       '@context': [],
  //       type: ['TestCredential'],
  //       credentialSubject: { id: 'did:max:mustermann' },
  //       id: 'unique_id',
  //       issuer: config.config.invite.id,
  //       // nonce: 'randomVC',
  //     },
  //     cryptoServiceRSA
  //   );
  // }, 15000);

  it('test set expiration date VC', async () => {
    if (!config.config.invite) throw Error();

    const expDate = 1657372884;
    const vc = await vcIssuerService.createVerifiableCredential(
      {
        '@context': [],
        type: ['TestCredential'],
        credentialSubject: { id: 'did:max:mustermann' },
        id: 'unique_id',
        issuer: config.config.invite.id,
        expirationDate: expDate,
        // nonce: 'randomVC',
      },
      cryptoServiceRSA
    );

    const vcJWT = new JWT(vc);
    expect(vcJWT.getPayload().exp).toEqual(expDate);
  }, 15000);

  it('test set expiration date VP', async () => {
    if (!config.config.invite) throw Error();

    const expDate = 1657372884;
    const vp = await vcIssuerService.createVerifiablePresentation(
      {
        '@context': [],
        type: ['TestPresentation'],
        verifiableCredentials: [],
        domain: 'domain',
        challenge: 'challenge',
        holder: 'did:max:mustermann',
        nonce: 'randomVP',
        expirationDate: expDate,
      },
      cryptoServiceRSA
    );

    const vpJWT = new JWT(vp);
    expect(vpJWT.getPayload().exp).toEqual(expDate);
  }, 15000);

  it('create vp', async () => {
    const vp = await createVp();
    logger.debug(JSON.stringify(vp, null, 4));
    expect(vp).toBeDefined();
  }, 15000);
});
