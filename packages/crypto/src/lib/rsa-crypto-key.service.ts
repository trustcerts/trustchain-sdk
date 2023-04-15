import { base58Encode } from '@trustcerts/helpers';
import { CryptoKeyService } from './crypto-key.service';
import { DecryptedKeyPair } from './decrypted-key-pair';
import { hashAlgorithm, subtle } from './values';
import { exportKey } from './key';

export class RSACryptoKeyService extends CryptoKeyService {
  constructor(
    public algorithm: RsaHashedKeyGenParams = {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: hashAlgorithm,
    }
  ) {
    super();
  }

  async generateKeyPair(id: string): Promise<DecryptedKeyPair> {
    const keys = await subtle.generateKey(this.algorithm, true, [
      'sign',
      'verify',
    ]);
    return {
      privateKey: await exportKey(keys.privateKey),
      publicKey: await exportKey(keys.publicKey),
      identifier: `${id}#${await this.getFingerPrint(keys.publicKey)}`,
    };
  }

  async getFingerPrint(key: CryptoKey | JsonWebKey): Promise<string> {
    const jwk = await this.getJwk(key);
    if (!(await this.isCorrectKeyType(jwk)))
      throw new Error('key not supported');
    const values = {
      e: jwk.e,
      kty: jwk.kty,
      n: jwk.n,
    };
    const message = new TextEncoder().encode(JSON.stringify(values));
    const hash = new Uint8Array(await subtle.digest(hashAlgorithm, message));
    return base58Encode(new Uint8Array(hash));
  }
  async isCorrectKeyType(key: CryptoKey | JsonWebKey): Promise<boolean> {
    const jwk = await this.getJwk(key);
    return jwk.kty === 'RSA';
  }
}
