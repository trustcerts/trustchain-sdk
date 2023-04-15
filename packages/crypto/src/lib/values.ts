import { isBrowser } from '@trustcerts/helpers';
import { webcrypto } from 'crypto';
/**
 * Define the required objects based on the environment (if browser or nodejs)
 */
let subtle: SubtleCrypto;
let getRandomValues: (array?: Uint8Array) => Uint8Array;

if (!isBrowser()) {
  // TODO fix ts-ignore usage
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  subtle = webcrypto.subtle;
  getRandomValues = (array: Uint8Array = new Uint8Array(32)): Uint8Array =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    webcrypto.getRandomValues(array);
} else {
  subtle = window.crypto.subtle;
  getRandomValues = (array: Uint8Array = new Uint8Array(32)): Uint8Array => {
    return window.crypto.getRandomValues(array);
  };
}

/**
 * Defaults hash algorithm that is used for signatures and hashing.
 */
const hashAlgorithm = 'SHA-256';

export { hashAlgorithm, getRandomValues, subtle };
