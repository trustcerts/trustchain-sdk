import { defaultAlgorithm } from './sign';
import { subtle } from './values';

/**
 * Imports the crypto key object from a json web key.
 * @param keyValue
 * @param format
 * @param algorithm
 * @param keyUsages
 * @private
 */
export function importKey(
  keyValue: JsonWebKey,
  format: 'jwk',
  keyUsages: KeyUsage[],
  algorithm: Algorithm = defaultAlgorithm
): Promise<CryptoKey> {
  // TODO map keyValue field to find out the correct algorithm
  return subtle.importKey(
    format,
    keyValue,
    algorithm,
    true,
    keyUsages
  ) as Promise<CryptoKey>;
}

/**
 *
 * @param passphrase
 * @param salt
 * @param iterations
 * @param length
 * @returns
 */
export async function getBitsFromPassphrase(
  passphrase: string,
  salt: string,
  iterations = 100000,
  length = 256
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const passwordKey = await subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey', 'deriveBits']
  );
  return subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations,
      hash: 'SHA-512',
    },
    passwordKey,
    length
  );
}

/**
 * Returns the public key as a json web key.
 * @param key
 * @param format
 */
export function exportKey(key: CryptoKey): Promise<JsonWebKey> {
  return subtle.exportKey('jwk', key) as Promise<JsonWebKey>;
}
