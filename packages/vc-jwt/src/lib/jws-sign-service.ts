import { DecryptedKeyPair } from '@trustcerts/crypto';
import {
  DocumentLoader,
  ISignService,
  ProofValues,
  VerifiableCredential,
  VerifiableCredentialProof,
} from '@trustcerts/vc';

export interface VerifiableCredentialJwsProof
  extends VerifiableCredentialProof {
  jws: string;
}

export class JwsSignService
  implements ISignService<VerifiableCredentialJwsProof>
{
  constructor(
    private keyPair: DecryptedKeyPair,
    private docLoader = new DocumentLoader().getLoader()
  ) {}

  async sign(
    values: ProofValues
  ): Promise<VerifiableCredential<VerifiableCredentialJwsProof>> {
    // const keyPair = await Ed25519VerificationKey2020.generate();
    // const suite = new Ed25519Signature2020({ key: keyPair });
    // return await vc.issue({ values, suite, documentLoader: this.docLoader });
    throw new Error('');
  }
}
