import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { dirname } from 'path';
import { encode, decode } from './basen';

let write: (path: string, value: string) => void;
let exists: (path: string) => boolean;
let read: (path: string) => string;
let remove: (path: string) => void;
/**
 * Checks if code is run in browser
 */
function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
}

// base58 characters (Bitcoin alphabet)
const Base58Alphabet =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
/**
 * Encodes an input in a string via base58
 */
function base58Encode(buffer: Uint8Array): string {
  return encode(buffer, Base58Alphabet);
}

function base58Decode(string: string): Uint8Array {
  return decode(string, Base58Alphabet);
}

function base64Encode(input: any): string {
  return isBrowser()
    ? window.btoa(input)
    : Buffer.from(input).toString('base64');
}

function base64Decode(input: string): Buffer | string {
  return isBrowser() ? window.atob(input) : Buffer.from(input, 'base64');
}

if (!isBrowser()) {
  const getDirName = dirname;
  // TODO: writeFileSync is bad practice (synchronous): https://www.geeksforgeeks.org/node-js-fs-writefilesync-method/
  write = (path, contents) => {
    mkdirSync(getDirName(path), { recursive: true });
    writeFileSync(path, contents);
  };
  exists = existsSync;
  read = (path: string): string => readFileSync(path, 'utf-8');

  remove = unlinkSync;
} else {
  write = (path: string, value: string): void => {
    window.localStorage.setItem(path, value);
  };
  exists = (path: string): boolean =>
    window.localStorage.getItem(path) !== null;
  read = (path: string): string => window.localStorage.getItem(path) as string;
  remove = window.localStorage.removeItem;
}

/**
 * Waits a specific amount of time
 * @param amount
 * @returns
 */
function wait(amount: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), amount);
  });
}

export {
  write,
  exists,
  read,
  remove,
  isBrowser,
  base58Encode,
  base58Decode,
  base64Encode,
  base64Decode,
  wait,
};
