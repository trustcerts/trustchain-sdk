import { DecryptedKeyPair } from './decrypted-key-pair';
import { exportKey, importKey } from './key';
import { signInput } from './sign';

/**
 * Service to handle actions that include the own keypair that is loaded into the service.
 */
export class CryptoService {
  /**
   * key pair to sign and verify.
   * @private
   */
  public keyPair!: CryptoKeyPair;

  /**
   * unique fingerprint of the key.
   * @private
   */
  public fingerPrint!: string;

  /**
   * Loads keys if passed. If not one keypair is generated.
   */
  public async init(keyPair: DecryptedKeyPair): Promise<void> {
    this.keyPair = {
      privateKey: await importKey(
        keyPair.privateKey,
        'jwk',
        ['sign'],
        keyPair.algorithm
      ),
      publicKey: await importKey(
        keyPair.publicKey,
        'jwk',
        ['verify'],
        keyPair.algorithm
      ),
    };
    this.fingerPrint = keyPair.identifier;
  }

  /**
   * Signs a given signature.
   * @param value
   */
  public async sign(value: string): Promise<string> {
    return signInput(value, this.keyPair.privateKey);
  }

  /**
   * Returns the public key as an json web token.
   */
  getPublicKey(): Promise<JsonWebKey> {
    return exportKey(this.keyPair.publicKey);
  }
}
