import {
  DecryptedKeyPair,
  hashAlgorithm,
  RSACryptoKeyService,
} from '@trustcerts/crypto';
import { ECTestKey, RSATestKey, RSATestKeyFingerPrint } from './test-values';

// TODO: Refactor RSA & EC cryptoKeyService tests / code reuse?
describe('test rsa-crypto-key-service.ts', () => {
  let rsaCryptoKeyService: RSACryptoKeyService;

  beforeAll(async () => {
    rsaCryptoKeyService = new RSACryptoKeyService();
  }, 10000);
  it('test generateKeyPair', async () => {
    const keyPair = await rsaCryptoKeyService.generateKeyPair('testKey');

    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.publicKey).toBeDefined();
  }, 7000);
  it('test getFingerPrint', async () => {
    const fingerPrintPrivateKey = await rsaCryptoKeyService.getFingerPrint(
      RSATestKey.privateKey
    );
    expect(fingerPrintPrivateKey).toEqual(RSATestKeyFingerPrint);

    const fingerPrintPublicKey = await rsaCryptoKeyService.getFingerPrint(
      RSATestKey.publicKey
    );
    expect(fingerPrintPublicKey).toEqual(RSATestKeyFingerPrint);

    // expect getFingerPrint() with wrong key type (EC) to fail
    await expect(
      rsaCryptoKeyService.getFingerPrint(ECTestKey.privateKey)
    ).rejects.toThrowError('key not supported');
  }, 7000);
  it('test isCorrectKeyType', async () => {
    expect(
      await rsaCryptoKeyService.isCorrectKeyType(RSATestKey.privateKey)
    ).toBeTruthy();
    expect(
      await rsaCryptoKeyService.isCorrectKeyType(RSATestKey.publicKey)
    ).toBeTruthy();
  }, 7000);
});
