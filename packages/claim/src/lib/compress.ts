export abstract class Compress {
  abstract compress<T>(value: T): string;

  abstract decompress<T>(value: string): T;
}

export class JsonCompressor implements Compress {
  compress<T>(value: T): string {
    // base64 suits better than uri encode for shorter values.
    return JSON.stringify(value);
  }
  decompress<T>(value: string): T {
    return JSON.parse(value) as T;
  }
}
