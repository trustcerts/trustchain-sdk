import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import { CryptoService, defaultCryptoKeyService } from '@trustcerts/crypto';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { JWTPayloadVC } from '@trustcerts/vc';
import {
  JWT,
  JWTVerifiableCredentialVerifierService,
  VerifiableCredentialIssuerService,
} from '@trustcerts/vc-jwt';
import { RevocationService } from '@trustcerts/vc-revocation';
import { WalletService } from '@trustcerts/wallet';
import { readFileSync } from 'fs';

/**
 * Test vc class.
 */
describe('vc', () => {
  let config: ConfigService;

  let cryptoServiceRSA: CryptoService;

  let walletService: WalletService;

  beforeAll(async () => {
    const testValues = JSON.parse(readFileSync('./values.json', 'utf-8'));

    DidNetworks.add(testValues.network.namespace, testValues.network);
    Identifier.setNetwork(testValues.network.namespace);
    config = new LocalConfigService(testValues.filePath);
    await config.init(testValues.configValues);

    walletService = new WalletService(config);
    await walletService.init();

    cryptoServiceRSA = new CryptoService();

    const rsaKey = (
      await walletService.findOrCreate(
        VerificationRelationshipType.assertionMethod,
        defaultCryptoKeyService.algorithm
      )
    )[0];
    if (rsaKey !== undefined) {
      await cryptoServiceRSA.init(rsaKey);
    }
  }, 10000);

  /**
   * Creates an example JWT-encoded verifiable credential for testing
   * @returns A JWT-encoded verifiable credential with example data
   */
  async function createVc(): Promise<string> {
    const vcIssuerService = new VerifiableCredentialIssuerService();
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

  it('verify revocation JWT', async () => {
    const vc = await createVc();
    const vcJWT = new JWT(vc);
    const vcJWTPayload = vcJWT.getPayload() as JWTPayloadVC;
    const vcVerifierService = new JWTVerifiableCredentialVerifierService();
    const revocationService = new RevocationService();
    await revocationService.init();

    // Expect credential to be valid
    expect(await vcVerifierService.verifyCredential(vc)).toBe(true);
    if (!vcJWTPayload.vc.credentialStatus) throw Error();
    // Expect credential to be not revoked
    expect(
      await revocationService.isRevoked(vcJWTPayload.vc.credentialStatus)
    ).toBe(false);

    // Revoke credential
    await revocationService.setRevoked(vcJWTPayload.vc.credentialStatus, true);

    // Expect credential to be invalid
    expect(await vcVerifierService.verifyCredential(vc)).toBe(false);
    // Expect credential to be revoked
    expect(
      await revocationService.isRevoked(vcJWTPayload.vc.credentialStatus)
    ).toBe(true);

    // Un-revoke credential
    revocationService.setRevoked(vcJWTPayload.vc.credentialStatus, false);

    // Expect credential to be valid again
    expect(await vcVerifierService.verifyCredential(vc)).toBe(true);
    // Expect credential to be not revoked again
    expect(
      await revocationService.isRevoked(vcJWTPayload.vc.credentialStatus)
    ).toBe(false);
  }, 15000);

  it('test new credential on full revocation list', async () => {
    const revocationService = new RevocationService();
    await revocationService.init();

    jest
      .spyOn(RevocationService.prototype as any, 'isRevocationListFull')
      .mockReturnValueOnce(true);

    await expect(
      revocationService.getNewCredentialStatus()
    ).rejects.toThrowError('The revocation list is full!');
  }, 15000);

  it('test revocation list with invalid credential revocation list', async () => {
    const vc = await createVc();
    const vcJWT = new JWT(vc);
    const vcJWTPayload = vcJWT.getPayload() as JWTPayloadVC;
    const revocationService = new RevocationService();
    await revocationService.init();

    if (!vcJWTPayload.vc.credentialStatus) throw Error();

    vcJWTPayload.vc.credentialStatus.revocationListCredential = 'different url';

    // Expect isRevoked to fail because of invalid URL
    await expect(
      revocationService.isRevoked(vcJWTPayload.vc.credentialStatus)
    ).rejects.toThrowError(
      'Revocation list URL in credentialStatus does not equal this revocation list URL'
    );

    // Expect setRevoked to fail because of invalid URL
    await expect(
      revocationService.setRevoked(vcJWTPayload.vc.credentialStatus, true)
    ).rejects.toThrowError(
      'Revocation list URL in credentialStatus does not equal this revocation list URL'
    );
  }, 15000);

  it('test revocation list with invalid index', async () => {
    const vc = await createVc();
    const vcJWT = new JWT(vc);
    const vcJWTPayload = vcJWT.getPayload() as JWTPayloadVC;
    const revocationService = new RevocationService();
    await revocationService.init();

    if (!vcJWTPayload.vc.credentialStatus) throw Error();

    vcJWTPayload.vc.credentialStatus.revocationListIndex = '999999999';

    // Expect isRevoked to fail because of invalid index
    await expect(
      revocationService.isRevoked(vcJWTPayload.vc.credentialStatus)
    ).rejects.toThrowError('index is not used yet');

    // Expect setRevoked to fail because of invalid index
    await expect(
      revocationService.setRevoked(vcJWTPayload.vc.credentialStatus, true)
    ).rejects.toThrowError('index is not used yet');
  }, 15000);
});
