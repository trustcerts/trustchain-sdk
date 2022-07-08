import { DecryptedKeyPair, ECCryptoKeyService } from '@trustcerts/crypto';

describe('test ec-crypto-key-service.ts', () => {
  const testKey: DecryptedKeyPair<EcKeyGenParams> = {
    privateKey: {
      key_ops: ['sign'],
      ext: true,
      kty: 'EC',
      x: 'XtEAP3QH1XrcHbX1NyNrDnnSCKeBjtUv-nuQa0Peq9IgfB7TFpSLkZ3suLdlxtxH',
      y: 't1hAhbqEerVLyQGwREb1ptVbFk0XhSB6y8E1jleia0YbF9CUBwmsZ1QPzSayBWJM',
      d: 'JIWQ80paK6t8659q0I0uaeTqI6ACqzYITzr3JoSxMwrxlyRZJx3YkhMt4icwFQpO',
      crv: 'P-384',
    },
    publicKey: {
      key_ops: ['verify'],
      ext: true,
      kty: 'EC',
      x: 'XtEAP3QH1XrcHbX1NyNrDnnSCKeBjtUv-nuQa0Peq9IgfB7TFpSLkZ3suLdlxtxH',
      y: 't1hAhbqEerVLyQGwREb1ptVbFk0XhSB6y8E1jleia0YbF9CUBwmsZ1QPzSayBWJM',
      crv: 'P-384',
    },
    identifier: 'testKey#7zHB3gvjci5CSzNkpWLegzeAcGNzqDVyH6VNoVTVcUrd',
    algorithm: {
      name: 'ECDSA',
      namedCurve: 'P-384',
    },
  };
  const testKeyFingerPrint = '7zHB3gvjci5CSzNkpWLegzeAcGNzqDVyH6VNoVTVcUrd';

  let ecCryptoKeyService: ECCryptoKeyService;

  beforeAll(async () => {
    ecCryptoKeyService = new ECCryptoKeyService();
  }, 10000);
  it('test generateKeyPair', async () => {
    const keyPair = await ecCryptoKeyService.generateKeyPair('testKey');

    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.publicKey).toBeDefined();
  }, 7000);
  it('test getFingerPrint', async () => {
    const fingerPrintPrivateKey = await ecCryptoKeyService.getFingerPrint(
      testKey.privateKey
    );
    expect(fingerPrintPrivateKey).toEqual(testKeyFingerPrint);

    const fingerPrintPublicKey = await ecCryptoKeyService.getFingerPrint(
      testKey.publicKey
    );
    expect(fingerPrintPublicKey).toEqual(testKeyFingerPrint);
  }, 7000);
  it('test isCorrectKeyType', async () => {
    expect(
      await ecCryptoKeyService.isCorrectKeyType(testKey.privateKey)
    ).toBeTruthy();
    expect(
      await ecCryptoKeyService.isCorrectKeyType(testKey.publicKey)
    ).toBeTruthy();
  }, 7000);
});
