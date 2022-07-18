import { Bls12381G2KeyPair } from '@mattrglobal/jsonld-signatures-bbs';
import {
  DecryptedKeyPair,
  hashAlgorithm,
  subtle,
  CryptoKeyService,
} from '@trustcerts/crypto';
import { base58Encode } from '@trustcerts/helpers';

export interface BBSKeyGenParams extends Algorithm {
  namedCurve: string;
}

export class BbsCryptoKeyService extends CryptoKeyService {
  constructor(
    public algorithm: BBSKeyGenParams = {
      name: 'ECDSA',
      namedCurve: 'Bls12381G2',
    }
  ) {
    super();
  }

  async generateKeyPair(
    id: string
  ): Promise<DecryptedKeyPair<BBSKeyGenParams>> {
    const bbsKeyPair = await Bls12381G2KeyPair.generate();
    if (!bbsKeyPair.privateKeyJwk) throw Error();
    return {
      privateKey: bbsKeyPair.privateKeyJwk,
      publicKey: bbsKeyPair.publicKeyJwk,
      identifier: `${id}#${await this.getFingerPrint(bbsKeyPair.publicKeyJwk)}`,
      algorithm: this.algorithm,
    };
  }

  async getFingerPrint(key: JsonWebKey | CryptoKey): Promise<string> {
    const jwk = await this.getJwk(key);
    if (!(await this.isCorrectKeyType(jwk)))
      throw new Error('key not supported');
    const values = {
      crv: jwk.crv,
      kty: jwk.kty,
      x: jwk.x,
    };
    const message = new TextEncoder().encode(JSON.stringify(values));
    const hash = new Uint8Array(await subtle.digest(hashAlgorithm, message));
    return base58Encode(new Uint8Array(hash));
  }

  async isCorrectKeyType(key: JsonWebKey | CryptoKey): Promise<boolean> {
    const jwk = await this.getJwk(key);
    return (
      jwk.kty === 'EC' &&
      jwk.crv !== undefined &&
      ['BLS12381_G1', 'BLS12381_G2'].includes(jwk.crv)
    );
  }
}
