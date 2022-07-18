import { encode, decode } from 'bs58';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { dirname } from 'path';

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

/**
 * Encodes an input in a string via base58
 */
function base58Encode(buffer: Buffer | number[] | Uint8Array): string {
  return encode(buffer);
}

function base58Decode(string: string): Uint8Array {
  return decode(string);
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

export { write, exists, read, remove, isBrowser, base58Encode, base58Decode };
