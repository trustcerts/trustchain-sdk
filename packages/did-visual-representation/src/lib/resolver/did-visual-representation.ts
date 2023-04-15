import { Did, Management } from '@trustcerts/did';
import {
  DidVisualRepresentationStructure,
  Presentation,
} from '@trustcerts/gateway';
import {
  DidVisualRepresentationDocument,
  PresentationType,
  VisualRepresentationDocResponse,
} from '@trustcerts/observer';

export class DidVisualRepresentation extends Did {
  static objectName = 'vr';

  /**
   * types of presentations that can be added to a visual representation
   */
  private presentation = new Management<Presentation>();

  constructor(public override id: string) {
    super(id, DidVisualRepresentation.objectName, 22);
  }

  async parseTransactions(
    structures: DidVisualRepresentationStructure[]
  ): Promise<void> {
    for (const structure of structures) {
      this.version++;
      // validate signature of transaction
      // parse it into the existing document
      this.parseTransactionControllers(structure);

      if (structure.presentation?.remove) {
        structure.presentation.remove.forEach((id) =>
          this.presentation.current.delete(id)
        );
      }
      if (structure.presentation?.add) {
        structure.presentation.add.forEach((presentation) =>
          this.presentation.current.set(presentation.id, presentation)
        );
      }
    }
  }

  hasPresentation(id: string): boolean {
    return this.presentation.current.has(this.getFullId(id));
  }

  getPresentation(id: string): Presentation {
    const presentation = this.presentation.current.get(this.getFullId(id));
    if (!presentation) {
      throw new Error('presentation not found');
    }
    return presentation;
  }

  addPresentation(id: string, link: string, type: PresentationType): void {
    if (this.hasPresentation(id)) {
      throw Error('value id already used');
    }
    const presentation: Presentation = {
      id: this.getFullId(id),
      link,
      type,
    };
    this.presentation.current.set(presentation.id, presentation);
    this.presentation.add.set(presentation.id, presentation);
  }

  removePresentation(id: string): void {
    if (!this.hasPresentation(id)) {
      throw Error('presentation not found');
    }

    this.presentation.current.delete(this.getFullId(id));
    this.presentation.remove.add(this.getFullId(id));
  }

  async parseDocument(
    docResponse: VisualRepresentationDocResponse
  ): Promise<void> {
    this.parseDocumentSuper(docResponse);
    docResponse.document.presentation.forEach((presentation) =>
      this.addPresentation(
        presentation.id,
        presentation.link,
        presentation.type
      )
    );
  }

  getDocument(): DidVisualRepresentationDocument {
    return {
      '@context': this['@context'],
      id: this.id,
      controller: Array.from(this.controller.current.values()),
      presentation: Array.from(this.presentation.current.values()),
    };
  }
  resetChanges(): void {
    // TODO implement
  }

  getChanges(): DidVisualRepresentationStructure {
    const changes = this.getBasicChanges<DidVisualRepresentationStructure>();
    if (this.presentation.add.size > 0) {
      changes.presentation = {
        add: Array.from(this.presentation.add.values()),
      };
    }
    if (this.presentation.remove.size > 0) {
      if (!changes.presentation) {
        changes.presentation = {};
      }
      changes.presentation.remove = Array.from(
        this.presentation.remove.values()
      );
    }
    return changes;
  }
}
