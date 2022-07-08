// import { ConfigService } from '@trustcerts/config';
// import { LocalConfigService } from '@trustcerts/config-local';
// import {
//   CryptoService,
//   DecryptedKeyPair,
//   SignatureType,
// } from '@trustcerts/crypto';
// import {
//   DidNetworks,
//   Identifier,
//   VerificationRelationshipType,
// } from '@trustcerts/did';
// import { logger } from '@trustcerts/logger';
// import { VerifiableCredentialBBS } from '@trustcerts/vc';
// import { BbsVerifiableCredentialIssuerService } from '@trustcerts/vc-bbs';
// import { WalletService } from '@trustcerts/wallet';
// import { readFileSync } from 'fs';

/**
 * Test vc class.
 */
describe('vc-bbs', () => {
  it('should be edited', () => {
    expect(true).toBeTruthy();
  });
  // let config: ConfigService;

  // let bbsAssertionKey: DecryptedKeyPair;
  // let bbsAuthenticationKey: DecryptedKeyPair;

  // let cryptoServiceRSA: CryptoService;

  // let walletService: WalletService;

  // beforeAll(async () => {
  //   const testValues = JSON.parse(readFileSync('./values.json', 'utf-8'));

  //   DidNetworks.add(testValues.network.namespace, testValues.network);
  //   Identifier.setNetwork(testValues.network.namespace);
  //   config = new LocalConfigService(testValues.filePath);
  //   await config.init(testValues.configValues);

  //   walletService = new WalletService(config);
  //   await walletService.init();

  //   cryptoServiceRSA = new CryptoService();

  //   bbsAssertionKey = (
  //     await walletService.findOrCreate(
  //       VerificationRelationshipType.assertionMethod,
  //       SignatureType.Bbs
  //     )
  //   )[0];
  //   bbsAuthenticationKey = (
  //     await walletService.findOrCreate(
  //       VerificationRelationshipType.authentication,
  //       SignatureType.Bbs
  //     )
  //   )[0];

  //   const rsaKey = (
  //     await walletService.findOrCreate(
  //       VerificationRelationshipType.assertionMethod,
  //       defaultCryptoKeyService.algorithm
  //     )
  //   )[0];
  //   if (rsaKey !== undefined) {
  //     await cryptoServiceRSA.init(rsaKey);
  //   }
  // }, 40000);

  // /**
  //  * Creates an example BBS+ signed verifiable credential for testing
  //  * @returns A BBS+ signed verifiable credential with example data
  //  */
  // async function createVcBbs(): Promise<VerifiableCredentialBBS> {
  //   if (!config.config.invite) throw new Error();
  //   const bbsVcIssuerService = new BbsVerifiableCredentialIssuerService();

  //   return await bbsVcIssuerService.createBBSVerifiableCredential(
  //     {
  //       '@context': ['https://w3id.org/citizenship/v1'],
  //       type: ['PermanentResidentCard'],
  //       credentialSubject: {
  //         type: ['PermanentResident', 'Person'],
  //         id: 'did:max:mustermann',
  //         givenName: 'Max',
  //         familyName: 'Mustermann',
  //       },
  //       id: 'unique_id',
  //       issuer: config.config.invite.id,
  //       nonce: 'randomVC',
  //     },
  //     bbsAssertionKey
  //   );
  // }

  // /**
  //  * Creates an example BBS+ signed verifiable presentation for testing
  //  * @returns A BBS+ signed verifiable presentation with example data
  //  */
  // async function createVpBbs() {
  //   const vcIssuerService = new BbsVerifiableCredentialIssuerService();
  //   const vc1 = await createVcBbs();
  //   const vc2 = await createVcBbs();
  //   return await vcIssuerService.createVerifiablePresentation(
  //     {
  //       '@context': [],
  //       type: [],
  //       verifiableCredential: [vc1, vc2],
  //       domain: 'domain',
  //       challenge: 'challenge',
  //       holder: 'did:max:mustermann',
  //     },
  //     bbsAuthenticationKey
  //   );
  // }

  // // BBS+
  // it('create BBS vc', async () => {
  //   const vc = await createVcBbs();
  //   logger.debug(vc);
  //   expect(vc).toBeDefined();
  // }, 15000);

  // it('create BBS vp', async () => {
  //   const vp = await createVpBbs();
  //   logger.debug(JSON.stringify(vp, null, 4));
  //   expect(vp).toBeDefined();
  // }, 15000);
});
