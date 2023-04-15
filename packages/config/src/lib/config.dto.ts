import { DecryptedKeyPair } from '@trustcerts/crypto';

export class Invite {
  /**
   * Identifier that was added to the chain for this did.
   */
  id!: string;
  /**
   * Pre shared secret
   */
  secret?: string;
  /**
   * Endpoint where the secret is stored
   */
  endpoint?: string;
}

export class Config {
  /**
   * Human readable name
   */
  name?: string;

  /**
   * Invite secret to add a did or to update it.
   */
  invite?: Invite;

  /**
   * Keypair that is connected with the did.
   */
  keyPairs!: DecryptedKeyPair[];
}
