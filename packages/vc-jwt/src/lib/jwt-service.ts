import { base64UrlDecode } from '@trustcerts/helpers';
import { JWTHeader, JWTPayload } from '@trustcerts/vc';

export class JWT {
  private header: JWTHeader;
  private payload: JWTPayload;
  private signature: string;

  /**
   * Creates a new JWT from the encoded JWT string
   * @param jwt The JWT as an encoded string
   */
  constructor(private jwt: string) {
    // const jwtHeader : JWTHeader = JSON.parse(Buffer.from(presentation.split('.')[0], 'base64url').toString('binary')) as JWTHeader;

    const jwtParts = jwt.split('.');

    this.header = this.decode(jwtParts[0]);
    this.payload = this.decode(jwtParts[1]);
    this.signature = jwtParts[2];
  }

  /**
   * @returns The header of the JWT
   */
  public getHeader(): JWTHeader {
    return this.header;
  }

  /**
   * @returns The payload of the JWT
   */
  public getPayload<T extends JWTPayload>(): T {
    return this.payload as T;
  }

  /**
   * @returns The signature of the JWT
   */
  public getSignature(): string {
    return this.signature;
  }

  /**
   * @returns The JWT encoded as a string
   */
  public getJWT(): string {
    return this.jwt;
  }

  /**
   * Decodes a base64url encoded payload
   * @param value The base64url encoded payload
   * @returns The decoded payload
   */
  decode<T>(value: string): T {
    const decoded = new TextDecoder().decode(base64UrlDecode(value));
    return JSON.parse(decoded) as T;
  }
}
