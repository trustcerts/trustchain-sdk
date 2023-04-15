import {
  ICredentialStatus,
  IVerifiableCredentialArguments,
  ProofPurpose,
  ProofType,
} from './credential.interface';

/**
 * Interface to define different proofs like jws or bbs
 */
export class VerifiableCredentialProof {
  type!: ProofType;
  created!: string;
  verificationMethod!: string;
  proofPurpose!: ProofPurpose;
}

/**
 * Verifiable credential with all possible fields
 */
export interface VerifiableCredential<
  ProofType extends VerifiableCredentialProof
> extends IVerifiableCredentialArguments {
  credentialStatus?: ICredentialStatus;
  issuanceDate: string;
  nonce?: string;
  proof: ProofType;
}

/**
 * Relevant values to generate the proof
 */
export type ProofValues = Omit<
  VerifiableCredential<VerifiableCredentialProof>,
  'proof'
>;

/**
 * Abstract Service to implement to be used to sign a verifiable credential
 */
export interface ISignService<ProofType extends VerifiableCredentialProof> {
  /**
   * signs the values of a credential.
   * @param values
   */
  sign(values: ProofValues): Promise<VerifiableCredential<ProofType>>;
}

/**
 * Interface of a revocation
 */
export interface IStatusListService {
  getNewCredentialStatus(): Promise<ICredentialStatus>;
}

/**
 * Creates a vc based on the passed values.
 * @param vcPayload
 * @param proofService
 * @returns
 */
export async function createVC<ProofType extends VerifiableCredentialProof>(
  vcPayload: IVerifiableCredentialArguments,
  proofService: ISignService<ProofType>,
  statusListService?: IStatusListService
): Promise<VerifiableCredential<ProofType>> {
  const issuanceDate = new Date().toISOString();

  const vc: ProofValues = { ...vcPayload, issuanceDate };
  if (statusListService) {
    vc.credentialStatus = await statusListService.getNewCredentialStatus();
    vcPayload['@context'].push('https://w3id.org/vc/status-list/2021/v1');
  }
  return proofService.sign(vc);
}
