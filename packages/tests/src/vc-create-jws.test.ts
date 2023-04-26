// import { ConfigService } from '@trustcerts/config';
// import { LocalConfigService } from '@trustcerts/config-local';
// import {
//   DecryptedKeyPair,
//   CryptoService,
//   defaultCryptoKeyService,
//   RSACryptoKeyService,
// } from '@trustcerts/crypto';
// import {
//   DidNetworks,
//   Identifier,
//   VerificationRelationshipType,
// } from '@trustcerts/did';
// import { logger } from '@trustcerts/logger';
// import { createVC, IVerifiableCredentialArguments } from '@trustcerts/vc';
// import { JwsSignService } from '@trustcerts/vc-jwt';
// import { WalletService } from '@trustcerts/wallet';
// import { readFileSync } from 'fs';

// /**
//  * Test vc class.
//  */
// describe('vc', () => {
//   let config: ConfigService;

//   let cryptoServiceRSA: CryptoService;

//   let walletService: WalletService;
//   let payload!: IVerifiableCredentialArguments;

//   beforeAll(async () => {
//     const testValues = JSON.parse(
//       readFileSync('./tests/values-dev.json', 'utf-8')
//     );

//     DidNetworks.add(testValues.network.namespace, testValues.network);
//     Identifier.setNetwork(testValues.network.namespace);
//     config = new LocalConfigService(testValues.filePath);
//     await config.init(testValues.configValues);

//     const rsaCryptoKeyService = new RSACryptoKeyService();
//     walletService = new WalletService(config, [rsaCryptoKeyService]);

//     await walletService.init();

//     cryptoServiceRSA = new CryptoService();

//     const rsaKey = (
//       await walletService.findOrCreate(
//         VerificationRelationshipType.assertionMethod,
//         defaultCryptoKeyService.algorithm
//       )
//     )[0];
//     if (rsaKey !== undefined) {
//       await cryptoServiceRSA.init(rsaKey);
//     }

//     if (!config.config.invite) throw new Error();
//     payload = {
//       '@context': [
//         'https://www.w3.org/2018/credentials/v1',
//         'https://w3id.org/citizenship/v1',
//       ],
//       type: ['VerifiableCredential', 'PermanentResidentCard'],
//       credentialSubject: {
//         type: ['PermanentResident', 'Person'],
//         id: 'did:max:mustermann',
//         givenName: 'Max',
//         familyName: 'Mustermann',
//       },
//       id: 'unique_id',
//       issuer: config.config.invite.id,
//     };
//   }, 40000);

//   // BBS+
//   it('create JWS vc', async () => {
//     const vc = await createVC(
//       payload,
//       new JwsSignService(null as any as DecryptedKeyPair)
//     );
//     logger.info(vc);
//     expect(vc).toBeDefined();
//   }, 15000);

//   it('create BBS vp', async () => {
//     // const vp = await createVpBbs();
//     // logger.debug(JSON.stringify(vp, null, 4));
//     // expect(vp).toBeDefined();
//   }, 15000);
// });
