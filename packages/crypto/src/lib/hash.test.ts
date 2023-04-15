import {
  getHash,
  getHashFromArrayBuffer,
  getHashFromFile,
  sortKeys,
} from '@trustcerts/crypto';
import { write, remove, exists } from '@trustcerts/helpers';
import { hashContent, hashContentHash } from './test-values';

describe('test hash.ts', () => {
  it('test get hash', async () => {
    const hashed = await getHash(hashContent);
    expect(hashed).toEqual(hashContentHash);
  }, 7000);
  it('test get hash from file', async () => {
    const temporaryFilePath = './tmp/cryptoTestFile';
    write(temporaryFilePath, hashContent);
    const hashed = await getHashFromFile(temporaryFilePath);
    expect(hashed).toEqual(hashContentHash);
    if (exists(temporaryFilePath)) {
      remove(temporaryFilePath);
    }
  }, 7000);
  it('test get hash from array buffer', async () => {
    const enc = new TextEncoder();
    const buffer = enc.encode(hashContent).buffer;
    const hashed = await getHashFromArrayBuffer(buffer);
    expect(hashed).toEqual(hashContentHash);
  }, 7000);
  it('test sortKeys', async () => {
    // TODO: insert more edge cases / more complicated example?
    const unsortedJSON = '{"Z":"last","A":"first"}';
    const sortedJSON = '{"A":"first","Z":"last"}';
    const testObj = JSON.parse(unsortedJSON);
    expect(JSON.stringify(testObj)).not.toEqual(sortedJSON);
    expect(JSON.stringify(testObj)).toEqual(unsortedJSON);
    const sortedObj = sortKeys(testObj);
    expect(JSON.stringify(sortedObj)).not.toEqual(unsortedJSON);
    expect(JSON.stringify(sortedObj)).toEqual(sortedJSON);
  }, 7000);
});
