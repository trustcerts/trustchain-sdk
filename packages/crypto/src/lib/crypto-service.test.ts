import { CryptoService } from '@trustcerts/crypto';
import { testKey, content, contentSignature } from './test-values';

let cryptoService: CryptoService;
describe('test crypto-service.ts', () => {
  beforeAll(async () => {
    cryptoService = new CryptoService();
    await cryptoService.init(testKey);
  }, 10000);
  it('test cryptoService.init', async () => {
    const testCryptoService = new CryptoService();
    await testCryptoService.init(testKey);
    expect(testCryptoService.keyPair.privateKey).toBeDefined();
    expect(testCryptoService.keyPair.publicKey).toBeDefined();
    expect(testCryptoService.fingerPrint).toEqual(testKey.identifier);
  }, 7000);
  it('test sign', async () => {
    const contentSigned = await cryptoService.sign(content);
    expect(contentSigned).toEqual(contentSignature);
  }, 7000);
  it('test getPublicKey', async () => {
    expect(await cryptoService.getPublicKey()).toEqual(testKey.publicKey);
  }, 7000);
});
