import { DidHash } from '@trustcerts/did-hash';
import { DidTemplate } from '@trustcerts/did-template';
import * as mustache from 'mustache';
import { PDFButton, PDFDocument, PDFFont, PDFTextField } from 'pdf-lib';
import { toDataURL } from 'qrcode';
import { ClaimValues } from './claim-values';
import { JsonCompressor } from './compress';

/**
 * Class object to handle a claim
 */
export class Claim {
  /**
   * Url of the claim.
   */
  private url: string;

  /**
   * Information about the validation.
   */
  private hash?: DidHash;

  /**
   * Sets values based on compression algorithm.
   *
   * @param values
   * @param template
   * @param host
   */
  constructor(
    public values: ClaimValues,
    private template: DidTemplate,
    host: string
  ) {
    const compressor = new JsonCompressor();
    this.url = this.setUrl(
      host,
      template.id,
      compressor.compress<ClaimValues>(values)
    );
  }

  /**
   * returns the template id of the claim.
   *
   * @returns
   */
  public getTemplateId(): string {
    return this.template.id;
  }

  /**
   * Generates the qr code of a url.
   *
   * @param url
   */
  private async getQRCode(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      toDataURL(
        url,
        {
          errorCorrectionLevel: 'L',
          color: {
            dark: '#000',
            light: '#0000',
          },
        },
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        }
      );
    });
  }

  /**
   * Builds the url of the element.
   *
   * @param host
   * @param templateDid
   * @param values
   */
  private setUrl(host: string, templateDid: string, values: string): string {
    return `${host}/${templateDid}#${encodeURIComponent(values)}`;
  }

  /**
   * Returns the url including the host, template reference and values.
   *
   * @returns
   */
  public getUrl(): string {
    return this.url;
  }

  /**
   * Generates the html representation of a claim.
   */
  public async getHtml(): Promise<string> {
    const qrCode = await this.getQRCode(this.url);
    return mustache.render(this.template.template, {
      ...this.values,
      qrCode,
    });
  }

  public async getPdf(template: ArrayBuffer) {
    const doc = await PDFDocument.load(template);
    const form = doc.getForm();
    for (const field of form.getFields()) {
      const key = field.getName();
      if (key !== 'random') {
        if (field instanceof PDFTextField) {
          if (field.isMultiline()) {
            const font = form.getDefaultFont();
            const width = field.acroField.getWidgets()[0].getRectangle().width;
            // TODO set correct font size
            let formatted = this.fillParagraph(
              this.values[key] as string,
              font,
              12,
              width
            );
            for (let i = formatted.split('\n').length; i < 3; i++) {
              formatted = '\n' + formatted;
            }
            field.setText(formatted);
          } else {
            field.setText(this.values[key] as string);
          }
        } else if (field instanceof PDFButton) {
          let imgInput;
          if (key === 'qrcode') {
            // set qrcode
            imgInput = await this.getQRCode(this.url);
          } else if (this.values[key]) {
            throw new Error('not implemented yet');
            // const imageUrl = await firstValueFrom(
            //   this.imageApiService.imageControllerGetImageById(value[key])
            // ).catch(() => {
            //   alert(`no image found with ${value[key]}`);
            //   throw new Error();
            // });
            // imgInput = await (
            //   await firstValueFrom(
            //     this.httpClient.get(imageUrl.url, { responseType: 'blob' })
            //   )
            // ).arrayBuffer();
          } else {
            imgInput =
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAAAAACoWZBhAAAACXBIWXMAAAsTAAALEwEAmpwYAAAE6WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMi0wNS0yN1QxODowMDo1NiswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMi0wNS0yN1QxODowMDo1NiswMjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjItMDUtMjdUMTg6MDA6NTYrMDI6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmYxOTMxOGE4LTc2ZmQtYjk0NC1iMmY4LWIxOWU2MDYwNzdjZCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpmMTkzMThhOC03NmZkLWI5NDQtYjJmOC1iMTllNjA2MDc3Y2QiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpmMTkzMThhOC03NmZkLWI5NDQtYjJmOC1iMTllNjA2MDc3Y2QiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjEiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmYxOTMxOGE4LTc2ZmQtYjk0NC1iMmY4LWIxOWU2MDYwNzdjZCIgc3RFdnQ6d2hlbj0iMjAyMi0wNS0yN1QxODowMDo1NiswMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7rF0CcAAAAD0lEQVQIHWP4DwcMtGcCAGgtY50Zi1E2AAAAAElFTkSuQmCC';
          }
          if (imgInput) {
            const img = await doc.embedPng(imgInput);
            field.setImage(img);
          }
        }
      }
    }
    // TODO set random

    form.flatten();
    return doc.save();
  }

  private fillParagraph(
    text: string,
    font: PDFFont,
    fontSize: number,
    maxWidth: number
  ): string {
    const paragraphs = text.split('\n');
    for (let index = 0; index < paragraphs.length; index++) {
      const paragraph = paragraphs[index];
      if (font.widthOfTextAtSize(paragraph, fontSize) > maxWidth) {
        const words = paragraph.split(' ');
        const newParagraph: string[][] = [];
        let i = 0;
        newParagraph[i] = [];
        for (let k = 0; k < words.length; k++) {
          const word = words[k];
          newParagraph[i].push(word);
          if (
            font.widthOfTextAtSize(newParagraph[i].join(' '), fontSize) >
            maxWidth
          ) {
            newParagraph[i].splice(-1); // retira a ultima palavra
            i = i + 1;
            newParagraph[i] = [];
            newParagraph[i].push(word);
          }
        }
        paragraphs[index] = newParagraph.map((p) => p.join(' ')).join('\n');
      }
    }
    return paragraphs.join('\n');
  }

  /**
   * Sets the validation results of the claim
   *
   * @param hash
   */
  public setValidation(hash: DidHash): void {
    this.hash = hash;
  }

  /**
   * Returns the validation information about the claim.
   *
   * @returns
   */
  public getValidation(): DidHash | undefined {
    return this.hash;
  }
}
