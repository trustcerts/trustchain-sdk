import {
  getHash,
  getHashFromArrayBuffer,
  getHashFromFile,
} from '@trustcerts/crypto';
import {
  DidResolver,
  Identifier,
  InitDidManagerConfigValues,
} from '@trustcerts/did';
import { DidHashStructure } from '@trustcerts/gateway';
import { DidHash } from './did-hash';
import { DidHashVerifierService } from './hash-verifier-service';

export class DidHashResolver extends DidResolver<DidHashVerifierService> {
  constructor() {
    super();
    this.verifier = new DidHashVerifierService();
  }

  public async load(
    id: string,
    values?: InitDidManagerConfigValues<DidHashStructure>
  ): Promise<DidHash> {
    if (!id.startsWith('did:trust')) {
      id = Identifier.generate(DidHash.objectName, id);
    }
    const didID = id.split('#')[0];
    const config = this.setConfig<DidHashStructure>(values);
    const did = new DidHash(didID);
    await this.loadDid(did, config);
    return did;
  }

  public async verifyString(
    value: string,
    config?: InitDidManagerConfigValues<DidHashStructure>
  ): Promise<DidHash> {
    const hash = await getHash(value);
    return this.load(hash, config);
  }

  public async verifyBuffer(
    value: ArrayBuffer,
    config?: InitDidManagerConfigValues<DidHashStructure>
  ): Promise<DidHash> {
    const hash = await getHashFromArrayBuffer(value);
    return this.load(hash, config);
  }

  public async verifyFile(
    file: string | File,
    config?: InitDidManagerConfigValues<DidHashStructure>
  ): Promise<DidHash> {
    const hash = await getHashFromFile(file);
    return this.load(hash, config);
  }
}
