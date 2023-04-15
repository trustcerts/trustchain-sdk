/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import base64url from 'base64url';
import { gzip, ungzip } from 'pako';

export class Bitstring {
  bits: Uint8Array = new Uint8Array();
  length = 0;

  constructor({
    length,
    buffer,
  }: { length?: number; buffer?: Uint8Array } = {}) {
    if (length && buffer) {
      throw new Error('Only one of "length" or "buffer" must be given.');
    }
    if (length) {
      this.bits = new Uint8Array(Math.ceil(length / 8));
      this.length = length;
    }
    if (buffer) {
      this.bits = new Uint8Array(buffer.buffer);
      this.length = buffer.length * 8;
    }
  }

  /**
   * Sets a value in a bitstring
   *
   * @param position
   * @param on
   */
  set(position: number, on: boolean) {
    const { index, bit } = _parsePosition(position, this.length);
    if (on) {
      this.bits[index] |= bit;
    } else {
      this.bits[index] &= 0xff ^ bit;
    }
  }

  /**
   * Get the value at a certain position.
   *
   * @param position index of the bitstring
   * @returns positive or negative value
   */
  get(position: number) {
    const { index, bit } = _parsePosition(position, this.length);
    return !!(this.bits[index] & bit);
  }

  /**
   * Encodes the compressed bitstring
   *
   * @returns
   */
  encodeBits() {
    return base64url.encode(Buffer.from(gzip(this.bits)));
  }

  /**
   * Decompresses the base encoded imput
   *
   * @param encoded
   * @returns
   */
  static decodeBits(encoded: string) {
    return ungzip(base64url.toBuffer(encoded));
  }

  // /**
  //  * Compresses the bitstring
  //  *
  //  * @returns
  //  */
  // async compressBits() {
  //   return gzip(this.bits);
  // }

  // /**
  //  * Uncompresses the bitstring
  //  *
  //  * @param compressed
  //  * @returns
  //  */
  // static async uncompressBits(compressed: Uint8Array) {
  //   return ungzip(compressed);
  // }
}

/**
 *
 * @param position
 * @param length
 */
function _parsePosition(position: number, length: number) {
  if (position >= length) {
    throw new Error(
      `Position "${position}" is out of range "0-${length - 1}".`
    );
  }
  const index = Math.floor(position / 8);
  const bit = 1 << position % 8;
  return { index, bit };
}
