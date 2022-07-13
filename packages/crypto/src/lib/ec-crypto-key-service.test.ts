import { DecryptedKeyPair, ECCryptoKeyService } from '@trustcerts/crypto';
import { ECTestKey, ECTestKeyFingerPrint, RSATestKey } from './test-values';

describe('test ec-crypto-key-service.ts', () => {
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
      ECTestKey.privateKey
    );
    expect(fingerPrintPrivateKey).toEqual(ECTestKeyFingerPrint);

    const fingerPrintPublicKey = await ecCryptoKeyService.getFingerPrint(
      ECTestKey.publicKey
    );
    expect(fingerPrintPublicKey).toEqual(ECTestKeyFingerPrint);

    // expect getFingerPrint() with wrong key type (RSA) to fail
    await expect(
      ecCryptoKeyService.getFingerPrint(RSATestKey.privateKey)
    ).rejects.toThrowError('key not supported');
  }, 7000);
  it('test isCorrectKeyType', async () => {
    expect(
      await ecCryptoKeyService.isCorrectKeyType(ECTestKey.privateKey)
    ).toBeTruthy();
    expect(
      await ecCryptoKeyService.isCorrectKeyType(ECTestKey.publicKey)
    ).toBeTruthy();
  }, 7000);
});
