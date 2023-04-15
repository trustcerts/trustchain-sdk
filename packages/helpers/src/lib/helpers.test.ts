import {
  base58Encode,
  base58Decode,
  write,
  exists,
  read,
  remove,
} from '@trustcerts/helpers';

describe('test helpers.test.ts', () => {
  const content = new Uint8Array([
    199, 108, 22, 203, 167, 110, 102, 26, 50, 180, 118, 116, 52, 92, 32, 167,
    11, 78, 255, 1, 163, 167, 19, 214, 16, 167, 88, 249, 242, 227, 59, 97,
  ]);
  const encodedContent = 'ERTj8TMMsaMggBEbU5TzTj7UxXPcMVCwhvzttUrXXEEk';

  it('test base58Encode', async () => {
    const encoded = base58Encode(content);
    expect(encoded).toEqual(encodedContent);
  }, 7000);

  it('test base58Decode', async () => {
    const decoded = base58Decode(encodedContent);
    expect(decoded).toEqual(content);
  }, 7000);

  it('test filesystem functions', async () => {
    const randomFilename = 'randomFilename' + new Date().getTime();
    const fileContent = 'The content to be written into the file';

    // Expect file to not exist yet
    expect(exists(randomFilename)).toBe(false);

    // Write content into the file
    write(randomFilename, fileContent);

    // Expect file to exist now
    expect(exists(randomFilename)).toBe(true);

    // Read content and expect it to be equal to what was written into the file
    let readContent = read(randomFilename);
    expect(readContent).toEqual(fileContent);

    // Write again to make sure that write() overwrites file instead of appending to existing file
    write(randomFilename, fileContent);
    readContent = read(randomFilename);
    expect(readContent).toEqual(fileContent);

    // Remove the file and expect that it does not exist anymore
    remove(randomFilename);
    expect(exists(randomFilename)).toBe(false);
  }, 7000);

  // TODO: test isBrowser?
});
