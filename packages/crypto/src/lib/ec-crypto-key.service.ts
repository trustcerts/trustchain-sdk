import { base58Encode } from '@trustcerts/helpers';
import { CryptoKeyService } from './crypto-key.service';
import { DecryptedKeyPair } from './decrypted-key-pair';
import { hashAlgorithm, subtle } from './values';
import { exportKey } from './key';

export class ECCryptoKeyService extends CryptoKeyService {
  constructor(
    public algorithm: EcKeyGenParams = {
      name: 'ECDSA',
      namedCurve: 'P-256',
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
      crv: jwk.crv,
      kty: jwk.kty,
      x: jwk.x,
      y: jwk.y,
    };
    const message = new TextEncoder().encode(JSON.stringify(values));
    const hash = new Uint8Array(await subtle.digest(hashAlgorithm, message));
    return base58Encode(new Uint8Array(hash));
  }
  async isCorrectKeyType(key: CryptoKey | JsonWebKey): Promise<boolean> {
    const jwk = await this.getJwk(key);
    return jwk.kty === 'EC';
  }
}
