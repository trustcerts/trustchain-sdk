import {
  getHashFromFile,
  getHashFromArrayBuffer,
  getHash,
} from '@trustcerts/crypto';
import { DidCreation, Identifier } from '@trustcerts/did';
import { SchemaResponse } from '@trustcerts/gateway';
import { DidHash } from '../resolver/did-hash';
import { DidHashResolver } from '../resolver/did-hash-resolver';
import { SignatureIssuerService } from './hash-issuer-service';

export interface DidHashCreation extends DidCreation {
  id: string;
  algorithm: string;
}

export class DidHashRegister {
  private didSignatrueResolver = new DidHashResolver();

  /**
   * creates a fresh did with a unique identifier. Add controller when they are passed.
   *
   * @param values
   */
  public create(values: DidHashCreation): DidHash {
    // TODO check if a given id should be allowed
    const id = values?.id ?? Identifier.generate(DidHash.objectName);
    const did = new DidHash(id);
    values.controllers?.forEach((controller) => did.addController(controller));
    did.algorithm = values.algorithm;
    return did;
  }

  public save(
    did: DidHash,
    client: SignatureIssuerService,
    date?: string
  ): Promise<SchemaResponse> {
    const value = did.getChanges();
    did.version++;
    did.resetChanges();
    return client.persist(value, date);
  }

  /**
   * Signs a file
   *
   * @param filePath
   * @param controllers
   * @returns {Promise<void>}
   */
  async signFile(filePath: string, controllers: string[]): Promise<DidHash> {
    const hash = await getHashFromFile(filePath);
    return this.create({
      id: Identifier.generate(DidHash.objectName, hash),
      algorithm: 'sha256',
      controllers,
    });
  }

  /**
   * Signs a buffer
   *
   * @param buffer
   * @param controllers
   * @returns {Promise<void>}
   */
  async signBuffer(
    buffer: ArrayBuffer,
    controllers: string[]
  ): Promise<DidHash> {
    const hash = await getHashFromArrayBuffer(buffer);
    return this.create({
      id: Identifier.generate(DidHash.objectName, hash),
      algorithm: 'sha256',
      controllers,
    });
  }

  /**
   * Signs a string.
   *
   * @param value
   * @param controllers
   */
  async signString(value: string, controllers: string[]): Promise<DidHash> {
    const hash = await getHash(value);
    return this.create({
      id: Identifier.generate(DidHash.objectName, hash),
      algorithm: 'sha256',
      controllers,
    });
  }

  /**
   * Revokes a file
   *
   * @param filePath
   * @param date
   * @returns {Promise<void>}
   */
  async revokeFile(
    filePath: string,
    date = new Date().toISOString()
  ): Promise<DidHash> {
    const hash = await getHashFromFile(filePath);
    return this.revoke(hash, date);
  }

  /**
   * Revokes a buffer
   *
   * @param buffer
   * @param date
   * @returns {Promise<void>}
   */
  async revokeBuffer(
    buffer: Buffer,
    date = new Date().toISOString()
  ): Promise<DidHash> {
    const hash = await getHashFromArrayBuffer(buffer);
    return this.revoke(hash, date);
  }

  /**
   * Revokes a string.
   *
   * @param value
   * @param date
   */
  async revokeString(
    value: string,
    date = new Date().toISOString()
  ): Promise<DidHash> {
    const hash = await getHash(value);
    return this.revoke(hash, date);
  }

  /**
   * Revokes a string
   *
   * @param hash
   * @param date
   * @private
   */
  private async revoke(hash: string, date: string) {
    const did = await this.didSignatrueResolver.load(
      Identifier.generate(DidHash.objectName, hash)
    );
    did.revoked = date;
    return did;
  }
}
