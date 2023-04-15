import { hashAlgorithm, subtle } from './values';

/**
 * Gets the algorithm of RSA and EC keys. BBS not supported since it's not part of the webcrypto api
 */
export function getAlgorithmFromJWK(jwk: JsonWebKey): Algorithm {
  // TODO import more RSA algorithms, not only the name but also with different modules Length
  if (jwk.kty === 'RSA') {
    return {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      // this one is based on alg
      hash: hashAlgorithm,
    } as RsaHashedKeyGenParams;
  }
  if (jwk.kty === 'EC' && jwk.crv === 'P-256') {
    return {
      name: 'ECDSA',
      namedCurve: 'P-256',
    } as EcKeyGenParams;
  }
  if (jwk.kty === 'EC' && jwk.crv === 'Bls12381G2') {
    return {
      name: 'ECDSA',
      namedCurve: 'Bls12381G2',
    } as EcKeyGenParams; // do not set bbs since the class is in the bbs package
  }
  throw Error(`key not known`);
}

/**
 * Imports the crypto key object from a json web key.
 * @param keyValue
 * @param format
 * @param keyUsages
 * @private
 */
export function importKey(
  keyValue: JsonWebKey,
  format: 'jwk',
  keyUsages: KeyUsage[]
): Promise<CryptoKey> {
  // TODO map keyValue field to find out the correct algorithm
  return subtle.importKey(
    format,
    keyValue,
    getAlgorithmFromJWK(keyValue),
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
