import { Identifier, DidCreation } from '@trustcerts/did';
import { VisualRepresentationResponse } from '@trustcerts/gateway';
import { DidVisualRepresentation } from '../resolver/did-visual-representation';
import { VisualRepresentationIssuerService } from './visual-representation-issuer-service';

export class DidVisualRepresentationRegister {
  /**
   * creates a fresh did with a unique identifier. Add controller when they are passed.
   *
   * @param values
   * @returns
   */
  public static create(values?: DidCreation): DidVisualRepresentation {
    // TODO check if a given id should be allowed
    const id =
      values?.id ?? Identifier.generate(DidVisualRepresentation.objectName);
    const did = new DidVisualRepresentation(id);
    values?.controllers?.forEach((controller) => did.addController(controller));
    return did;
  }

  public static save(
    did: DidVisualRepresentation,
    client: VisualRepresentationIssuerService
  ): Promise<VisualRepresentationResponse> {
    const value = did.getChanges();
    did.version++;
    did.resetChanges();
    return client.persist(value);
  }
}
