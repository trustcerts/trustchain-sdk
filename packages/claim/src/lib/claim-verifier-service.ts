import { ClaimValues } from './claim-values';
import { JsonCompressor } from './compress';
import { DidTemplateResolver } from '@trustcerts/did-template';
import { DidHash, DidHashResolver } from '@trustcerts/did-hash';
import { DidSchemaResolver } from '@trustcerts/did-schema';
import { Claim } from './claim';
import Ajv from 'ajv';
import { getHash, sortKeys } from '@trustcerts/crypto';
import { Identifier } from '@trustcerts/did';

/**
 * Verifier to validate claims
 */
export class ClaimVerifierService {
  private didTemplateResolver = new DidTemplateResolver();
  private didSchemaResolver = new DidSchemaResolver();
  private didHashResolver = new DidHashResolver();

  constructor(private host: string) {}

  /**
   * Builds a claim object based on the given url and the template engine and verifier endpoints.
   *
   * @param url
   * @param templateEngine
   * @param verifier
   * @returns
   */
  public async get(url: string): Promise<Claim> {
    // TODO right now the url only includes the parameter but not the host. evaluate if the whole url should be passed.
    const data = url.split('#');
    const did = data[0];
    const template = await this.didTemplateResolver.load(did);
    const compressor = new JsonCompressor();

    const values: ClaimValues = compressor.decompress<ClaimValues>(
      decodeURIComponent(data[1])
    );

    const schema = await this.didSchemaResolver.load(template.schemaId);
    // validate schema
    const avj = new Ajv();
    if (!avj.validate(JSON.parse(schema.getSchema()), values)) {
      throw new Error('values do not match with schema');
    }

    // verify
    const hashValue = await ClaimVerifierService.getHash(values, did);
    const hash = await this.didHashResolver
      .load(Identifier.generate(DidHash.objectName, hashValue))
      .catch(() => {
        throw Error('failed to verify');
      });
    const claim = new Claim(values, template, this.host);
    claim.setValidation(hash);
    return claim;
  }

  /**
   * Calculates the hash of the values.
   *
   * @param values
   * @param templateDid
   */
  public static async getHash(
    values: ClaimValues,
    templateDid: string
  ): Promise<string> {
    return getHash(JSON.stringify(sortKeys(values)) + templateDid);
  }
}
