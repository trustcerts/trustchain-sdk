import { base58Encode, isBrowser } from '@trustcerts/helpers';
import { existsSync, readFileSync } from 'fs';
import { hashAlgorithm, subtle } from './values';
/**
 * Returns the hash of a string as hex encoded string.
 * @param value
 */
export async function getHash(value: string): Promise<string> {
  const message = new TextEncoder().encode(value);
  const hashBuffer = await subtle.digest(hashAlgorithm, message);
  return base58Encode(new Uint8Array(hashBuffer));
}

/**
 * generate a hex encoded hash from a file.
 * @param file
 */
export async function getHashFromFile(file: string | File): Promise<string> {
  const buffer = await getFileContent(file);
  return getHashFromArrayBuffer(buffer);
}

/**
 * Generate a hex encoded hash from an array buffer.
 * @param buffer
 * @returns
 */
export async function getHashFromArrayBuffer(
  buffer: ArrayBuffer
): Promise<string> {
  const hashBuffer = await subtle.digest(hashAlgorithm, buffer);
  return base58Encode(new Uint8Array(hashBuffer));
}

/**
 * Gets the content of a file
 * @param file
 * @returns
 */
function getFileContent(file: string | File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    if (isBrowser()) {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(file as File);
    } else {
      if (existsSync(file as string)) {
        resolve(readFileSync(file as string));
      } else {
        reject('file not found');
      }
    }
  });
}

/**
 * Sorts the keys of an object
 * @param x
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortKeys(x: any): unknown {
  if (typeof x !== 'object' || !x) {
    return x;
  }
  if (Array.isArray(x)) {
    return x.map(sortKeys);
  }
  return Object.keys(x)
    .sort()
    .reduce((o, k) => ({ ...o, [k]: sortKeys(x[k]) }), {});
}
