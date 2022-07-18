import { DecryptedKeyPair } from './decrypted-key-pair';
import { subtle } from './values';

export abstract class CryptoKeyService {
  abstract algorithm: Algorithm;

  /**
   * Generates a new keyair
   * @param id
   */
  abstract generateKeyPair(id: string): Promise<DecryptedKeyPair>;

  /**
   * generates the fingerprint to identify the key
   * @param key
   */
  abstract getFingerPrint(key: JsonWebKey | CryptoKey): Promise<string>;

  /**
   * checks if the passed key matches with the service to handle it.
   * @param key
   */
  abstract isCorrectKeyType(key: JsonWebKey | CryptoKey): Promise<boolean>;

  protected async getJwk(key: CryptoKey | JsonWebKey): Promise<JsonWebKey> {
    return (key as JsonWebKey).kty
      ? (key as JsonWebKey)
      : await subtle.exportKey('jwk', key as CryptoKey);
  }
}
