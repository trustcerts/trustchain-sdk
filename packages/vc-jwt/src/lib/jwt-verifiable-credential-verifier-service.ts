import { ICredentialStatus, JWTPayloadVC, JWTPayloadVP } from '@trustcerts/vc';
import { jwtVerify } from 'jose';
import { JWT } from './jwt-service';
import { importKey } from '@trustcerts/crypto';
import { DidIdResolver } from '@trustcerts/did';
import { logger } from '@trustcerts/logger';
import { DidStatusListResolver } from '@trustcerts/did-status-list';

export class JWTVerifiableCredentialVerifierService {
  private resolver = new DidIdResolver();

  /**
   * Verifies a given verifiable credential, e.g. by checking its signature and revocation status
   *
   * @param credential The verifiable credential to be verified
   * @returns True if the verifiable credential is valid
   */
  async verifyCredential(credential: string): Promise<boolean> {
    const jwt = new JWT(credential);
    const kid = jwt.getHeader().kid;

    const did = await this.resolver.load(kid);

    const key = await importKey(did.getKey(kid).publicKeyJwk, 'jwk', [
      'verify',
    ]);

    try {
      await jwtVerify(credential, key);

      // Check revocation status
      const vcPayload = jwt.getPayload<JWTPayloadVC>();
      if (vcPayload.vc.credentialStatus) {
        const revoked = await this.isRevoked(vcPayload.vc.credentialStatus);
        if (revoked) {
          logger.debug('Credential verification failed: Credential is revoked');
          return false;
        }
      }

      logger.debug('Credential verification succeeded');
      return true;
    } catch (e) {
      logger.debug('Credential verification failed');
      logger.debug(e);
      return false;
    }
  }

  // TODO: Code-Dopplung mit BBS
  /**
   * Checks whether the given credential status has been revoked
   *
   * @param credentialStatus The credential status to be checked
   * @returns True if the given credential status has been revoked
   */
  async isRevoked(credentialStatus: ICredentialStatus): Promise<boolean> {
    return await new DidStatusListResolver().isRevoked(credentialStatus);
  }

  /**
   * Verifies a given verifiable presentation by verifying its signature and each of its credentials
   *
   * @param presentation The verifiable presentation to be verified
   * @returns True if the verifiable presentation is valid
   */
  async verifyPresentation(presentation: string): Promise<boolean> {
    const jwt = new JWT(presentation);

    const jwtPayload = jwt.getPayload<JWTPayloadVP>();

    const kid = jwt.getHeader().kid;

    const did = await this.resolver.load(kid);

    const key = await importKey(did.getKey(kid).publicKeyJwk, 'jwk', [
      'verify',
    ]);

    const credentials = jwtPayload.vp.verifiableCredentials;

    for (const credential of credentials) {
      if (!(await this.verifyCredential(credential))) {
        logger.debug('Verifiable Credential is invalid:');
        logger.debug(credential);
        return false;
      }
    }

    try {
      await jwtVerify(presentation, key);
      logger.debug('Presentation verification succeeded');
      return true;
    } catch (e) {
      logger.debug('Presentation verification failed');
      logger.debug(e);
      return false;
    }
  }
}
