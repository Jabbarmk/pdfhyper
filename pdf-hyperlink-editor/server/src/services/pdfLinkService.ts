import { PDFDocument, PDFName, PDFString, PDFNumber, PDFArray, PDFRef } from 'pdf-lib';
import fs from 'fs';

interface LinkData {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
}

export async function addLinksToPdf(filePath: string, links: LinkData[]): Promise<Uint8Array> {
  const fileBuffer = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const pageCount = pdfDoc.getPageCount();

  for (const link of links) {
    if (!link.url?.trim()) continue;

    const pageIndex = link.page - 1;
    if (pageIndex < 0 || pageIndex >= pageCount) continue;

    const page = pdfDoc.getPage(pageIndex);

    // Register URI action as an indirect object — better compatibility with
    // non-http schemes (mailto:, tel:) in Adobe Acrobat and other viewers
    const uriActionRef = pdfDoc.context.register(
      pdfDoc.context.obj({
        S: PDFName.of('URI'),
        URI: PDFString.of(link.url.trim()),
      })
    );

    const annotRef = pdfDoc.context.register(
      pdfDoc.context.obj({
        Type: PDFName.of('Annot'),
        Subtype: PDFName.of('Link'),
        Rect: pdfDoc.context.obj([
          PDFNumber.of(link.x),
          PDFNumber.of(link.y),
          PDFNumber.of(link.x + link.width),
          PDFNumber.of(link.y + link.height),
        ]),
        Border: pdfDoc.context.obj([
          PDFNumber.of(0),
          PDFNumber.of(0),
          PDFNumber.of(0),
        ]),
        A: uriActionRef,
      })
    );

    const annotsKey = PDFName.of('Annots');
    const annotsValue = page.node.get(annotsKey);

    if (annotsValue instanceof PDFArray) {
      annotsValue.push(annotRef);
    } else if (annotsValue instanceof PDFRef) {
      const resolved = pdfDoc.context.lookup(annotsValue);
      if (resolved instanceof PDFArray) {
        resolved.push(annotRef);
      } else {
        page.node.set(annotsKey, pdfDoc.context.obj([annotRef]));
      }
    } else {
      page.node.set(annotsKey, pdfDoc.context.obj([annotRef]));
    }
  }

  return pdfDoc.save();
}
