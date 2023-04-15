import {
  DidHashRegister,
  DidHashResolver,
  SignatureIssuerService,
  DidHash,
} from '@trustcerts/did-hash';
import { DidTemplate } from '@trustcerts/did-template';
import { DidSchemaResolver } from '@trustcerts/did-schema';
import Ajv from 'ajv';
import { Identifier } from '@trustcerts/did';
import { Claim } from './claim';
import { ClaimValues } from './claim-values';
import { ClaimVerifierService } from './claim-verifier-service';

/**
 * service to creaton and revocation of claims.
 */
export class ClaimIssuerService {
  private didSchemaResolver = new DidSchemaResolver();
  private didHashRegister = new DidHashRegister();
  private didHashResolver = new DidHashResolver();
  public ajv = new Ajv();
  /**
   * create a claim.
   *
   * @param template
   * @param values
   * @param host
   * @param signatureIssuer
   * @param controllers
   */
  async create(
    template: DidTemplate,
    values: ClaimValues,
    host: string,
    signatureIssuer: SignatureIssuerService,
    controllers: string[]
  ): Promise<Claim> {
    const schema = await this.didSchemaResolver.load(template.schemaId);
    if (!this.ajv.validate(JSON.parse(schema.getSchema()), values)) {
      throw Error('input does not match with schema');
    }
    const hash = await ClaimVerifierService.getHash(values, template.id);
    const didHash = this.didHashRegister.create({
      id: Identifier.generate(DidHash.objectName, hash),
      algorithm: 'sha256',
      controllers,
    });
    await this.didHashRegister.save(didHash, signatureIssuer);
    return new Claim(values, template, host);
  }

  /**
   * revokes a claim.
   *
   * @param claim
   * @param signatureIssuer
   */
  async revoke(
    claim: Claim,
    signatureIssuer: SignatureIssuerService
  ): Promise<void> {
    const hash = await ClaimVerifierService.getHash(
      claim.values,
      claim.getTemplateId()
    );
    const didHash = await this.didHashResolver
      .load(Identifier.generate(DidHash.objectName, hash))
      .catch(() => {
        throw new Error('hash of claim not found');
      });
    didHash.revoked = new Date().toISOString();
    await this.didHashRegister.save(didHash, signatureIssuer);
  }
}
