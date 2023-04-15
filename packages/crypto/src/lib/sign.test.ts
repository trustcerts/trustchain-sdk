import { importKey, signInput, verifySignature } from '@trustcerts/crypto';
import {
  content,
  contentSignature,
  differentContent,
  differentContentSignature,
  testKey,
} from './test-values';

describe('test sign.ts', () => {
  it('test verifySignature', async () => {
    const key = await importKey(testKey.publicKey, 'jwk', ['verify']);
    // Expect content to succeed verification
    const verificationResult = await verifySignature(
      content,
      contentSignature,
      key
    );
    expect(verificationResult).toBe(true);
    // Expect different content to fail verification
    const failedContentVerificationResult = await verifySignature(
      differentContent,
      contentSignature,
      key
    );
    expect(failedContentVerificationResult).toBe(false);
    // Expect different signature to fail verification
    const failedSignatureVerificationResult = await verifySignature(
      content,
      differentContentSignature,
      key
    );
    expect(failedSignatureVerificationResult).toBe(false);
    // Expect different content & different signature to succeed verification
    const differentVerificationResult = await verifySignature(
      differentContent,
      differentContentSignature,
      key
    );
    expect(differentVerificationResult).toBe(true);
  }, 7000);
  it('test signInput', async () => {
    const contentSigned = await signInput(
      content,
      await importKey(testKey.privateKey, 'jwk', ['sign'])
    );
    expect(contentSigned).toEqual(contentSignature);
  }, 7000);
});
