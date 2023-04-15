import {
  exportKey,
  getBitsFromPassphrase,
  importKey,
} from '@trustcerts/crypto';
import { testKey } from './test-values';

describe('test key.ts', () => {
  it('test importKey', async () => {
    const key = await importKey(testKey.publicKey, 'jwk', ['verify']);
    expect(key).toBeDefined();
  }, 7000);
  it('test getBitsFromPassphrase', async () => {
    const passphrase = 'passphrase';
    const salt = 'salt';
    const passphraseBits = new Uint8Array([
      199, 108, 22, 203, 167, 110, 102, 26, 50, 180, 118, 116, 52, 92, 32, 167,
      11, 78, 255, 1, 163, 167, 19, 214, 16, 167, 88, 249, 242, 227, 59, 97,
    ]);
    const bits = await getBitsFromPassphrase(passphrase, salt);
    expect(new Uint8Array(bits)).toEqual(passphraseBits);
  }, 7000);
  it('test exportKey', async () => {
    const importedKey = await importKey(testKey.publicKey, 'jwk', ['verify']);
    const exportedKey = await exportKey(importedKey);
    expect(exportedKey).toEqual(testKey.publicKey);
  }, 7000);
});
