import { DecryptedKeyPair, ECCryptoKeyService } from '@trustcerts/crypto';

describe('test ec-crypto-key-service.ts', () => {
  const testKey: DecryptedKeyPair<EcKeyGenParams> = {
    privateKey: {
      key_ops: ['sign'],
      ext: true,
      kty: 'EC',
      x: 'Fqjnj008-mC0IgOcbzglbi_NFh-zxryRNt7zPcqlu1I',
      y: 'DR1LuRrxRemGcnVBEzI_mVpBCAZNbOj76ThHIKl0lC0',
      d: '97VNPTBOInX61FuluyfzPcrlFKETig2kKjMDgvVR4so',
      crv: 'P-256',
    },
    publicKey: {
      key_ops: ['verify'],
      ext: true,
      kty: 'EC',
      x: 'Fqjnj008-mC0IgOcbzglbi_NFh-zxryRNt7zPcqlu1I',
      y: 'DR1LuRrxRemGcnVBEzI_mVpBCAZNbOj76ThHIKl0lC0',
      crv: 'P-256',
    },
    identifier: 'testKey#3jC2Vq3YpUBe3uGdUCHAnYz1iZFAKHTXmhs7Ev1QPCpP',
    algorithm: { name: 'ECDSA', namedCurve: 'P-256' },
  };
  const testKeyFingerPrint = '3jC2Vq3YpUBe3uGdUCHAnYz1iZFAKHTXmhs7Ev1QPCpP';

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
