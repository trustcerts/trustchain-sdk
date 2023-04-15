export interface IStatusListConfig {
  // unique identifier of the list
  id: string;
  // next free index to use when issuing
  nextIndex: number;
  // length of the list
  length: number;
}

export interface IStatusListCredential {
  '@context': string[];
  id: string;
  type: string[];
  credentialSubject: {
    id: string;
    type: string;
    encodedList: string;
  };
}

// TODO: Code-Dopplung mit ../vc-bbs/credential.interface.ts
export interface ICredentialStatus {
  id: string;
  type: string;
  statusListIndex: number;
  statusListCredential: string;
}
