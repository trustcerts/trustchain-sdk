import {
  deriveProof,
  BbsBlsSignatureProof2020,
} from '@mattrglobal/jsonld-signatures-bbs';
import { ConfigService } from '@trustcerts/config';
import { LocalConfigService } from '@trustcerts/config-local';
import {
  DecryptedKeyPair,
  CryptoService,
  defaultCryptoKeyService,
  RSACryptoKeyService,
} from '@trustcerts/crypto';
import { BbsCryptoKeyService } from '@trustcerts/crypto-bbs';
import {
  DidNetworks,
  Identifier,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { logger } from '@trustcerts/logger';
import { VerifiableCredentialBBS, DocumentLoader } from '@trustcerts/vc';
import { WalletService } from '@trustcerts/wallet';
import { readFileSync } from 'fs';
import { BbsVerifiableCredentialIssuerService } from './bbs-verifiable-credential-issuer-service';
import { BbsVerifiableCredentialVerifierService } from './bbs-verifiable-credential-verifier-service';
import { purposes, verify } from 'jsonld-signatures';

/**
 * Test vc class.
 */
describe('vc-bbs', () => {
  let config: ConfigService;

  let bbsAssertionKey: DecryptedKeyPair;
  let bbsAuthenticationKey: DecryptedKeyPair;

  let cryptoServiceRSA: CryptoService;

  let walletService: WalletService;

  beforeAll(async () => {
    const testValues = JSON.parse(readFileSync('./values.json', 'utf-8'));

    DidNetworks.add(testValues.network.namespace, testValues.network);
    Identifier.setNetwork(testValues.network.namespace);
    config = new LocalConfigService(testValues.filePath);
    await config.init(testValues.configValues);

    const rsaCryptoKeyService = new RSACryptoKeyService();
    const bbsCryptoKeyService = new BbsCryptoKeyService();
    walletService = new WalletService(config, [
      rsaCryptoKeyService,
      bbsCryptoKeyService,
    ]);

    await walletService.init();

    cryptoServiceRSA = new CryptoService();

    bbsAssertionKey = (
      await walletService.findOrCreate(
        VerificationRelationshipType.assertionMethod,
        bbsCryptoKeyService.algorithm
      )
    )[0];
    bbsAuthenticationKey = (
      await walletService.findOrCreate(
        VerificationRelationshipType.authentication,
        bbsCryptoKeyService.algorithm
      )
    )[0];

    const rsaKey = (
      await walletService.findOrCreate(
        VerificationRelationshipType.assertionMethod,
        defaultCryptoKeyService.algorithm
      )
    )[0];
    if (rsaKey !== undefined) {
      await cryptoServiceRSA.init(rsaKey);
    }
  }, 20000);

  /**
   * Creates an example BBS+ signed verifiable credential for testing
   * @returns A BBS+ signed verifiable credential with example data
   */
  async function createVcBbs(): Promise<VerifiableCredentialBBS> {
    if (!config.config.invite) throw new Error();
    const bbsVcIssuerService = new BbsVerifiableCredentialIssuerService();

    return await bbsVcIssuerService.createBBSVerifiableCredential(
      {
        '@context': ['https://w3id.org/citizenship/v1'],
        type: ['PermanentResidentCard'],
        credentialSubject: {
          type: ['PermanentResident', 'Person'],
          id: 'did:max:mustermann',
          givenName: 'Max',
          familyName: 'Mustermann',
        },
        id: 'unique_id',
        issuer: config.config.invite.id,
        nonce: 'randomVC',
      },
      bbsAssertionKey
    );
  }

  /**
   * Creates an example BBS+ signed verifiable presentation for testing
   * @returns A BBS+ signed verifiable presentation with example data
   */
  async function createVpBbs() {
    const vcIssuerService = new BbsVerifiableCredentialIssuerService();
    const vc1 = await createVcBbs();
    const vc2 = await createVcBbs();
    return await vcIssuerService.createVerifiablePresentation(
      {
        '@context': [],
        type: [],
        verifiableCredential: [vc1, vc2],
        domain: 'domain',
        challenge: 'challenge',
        holder: 'did:max:mustermann',
      },
      bbsAuthenticationKey
    );
  }

  it('BBS selective disclosure', async () => {
    const docLoader = new DocumentLoader().getLoader();
    const signedDocument = await createVcBbs();

    const revealDocument = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/citizenship/v1',
        'https://w3id.org/security/bbs/v1',
      ],
      type: ['VerifiableCredential', 'PermanentResidentCard'],
      credentialSubject: {
        '@explicit': true,
        type: ['PermanentResident', 'Person'],
        givenName: {},
      },
    };

    // Derive a proof
    const derivedProof = await deriveProof(signedDocument, revealDocument, {
      suite: new BbsBlsSignatureProof2020(),
      documentLoader: docLoader,
    });

    logger.debug(JSON.stringify(derivedProof, null, 2));

    //Verify the derived proof
    const verified = await verify(derivedProof, {
      suite: new BbsBlsSignatureProof2020(),
      purpose: new purposes.AssertionProofPurpose(),
      documentLoader: docLoader,
    });

    logger.debug('Verification result');
    logger.debug(JSON.stringify(verified, null, 2));

    expect(verified).toEqual(
      expect.objectContaining({
        verified: true,
      })
    );
  }, 15000);
  it('verify BBS vc', async () => {
    const vc = await createVcBbs();
    const vcVerifierService = new BbsVerifiableCredentialVerifierService();
    expect(await vcVerifierService.verifyCredential(vc)).toBe(true);
  }, 15000);

  it('verify BBS revoked vc', async () => {
    const vc = await createVcBbs();
    const vcVerifierService = new BbsVerifiableCredentialVerifierService();

    vcVerifierService.isRevoked = jest.fn().mockReturnValueOnce(true);

    expect(await vcVerifierService.verifyCredential(vc)).toEqual(false);
  }, 15000);

  it('verify BBS invalid vc', async () => {
    const vc = await createVcBbs();
    vc.proof.proofValue = 'invalid proofValue';
    const vcVerifierService = new BbsVerifiableCredentialVerifierService();

    expect(await vcVerifierService.verifyCredential(vc)).toEqual(false);
  }, 15000);

  it('verify BBS vp', async () => {
    const vp = await createVpBbs();
    logger.debug(vp);
    const vcVerifierService = new BbsVerifiableCredentialVerifierService();
    expect(await vcVerifierService.verifyPresentation(vp)).toBe(true);
  }, 15000);

  it('verify BBS vp with invalid vcs', async () => {
    const vp = await createVpBbs();
    const vcVerifierService = new BbsVerifiableCredentialVerifierService();
    vcVerifierService.verifyCredential = jest.fn().mockReturnValueOnce(false);
    expect(await vcVerifierService.verifyPresentation(vp)).toBe(false);
  }, 15000);

  it('verify BBS invalid vp', async () => {
    const vp = await createVpBbs();
    vp.proof.proofValue = 'invalid proofValue';
    const vcVerifierService = new BbsVerifiableCredentialVerifierService();

    expect(await vcVerifierService.verifyPresentation(vp)).toEqual(false);
  }, 15000);
});
