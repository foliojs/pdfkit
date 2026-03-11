import PDFKit from './pdfkit';

/**
 * Insert SVG into a PDF document created with PDFKit.
 *
 * @param doc the PDF document created with PDFKit
 * @param svg the SVG object or XML code
 * @param x the x position where the SVG will be added
 * @param y the y position where the SVG will be added
 * @param options See {@link SVGtoPDF.Options}
 */
export default function SVGtoPDF(
  doc: PDFKit.PDFDocument,
  svg: SVGElement | string,
  x?: number,
  y?: number,
  options?: SVGtoPDF.Options,
): void;

declare namespace SVGtoPDF {
  type RGBColor = [[number, number, number], number];
  type CMYKColor = [[number, number, number, number], number];

  interface Options {
    /** initial viewport width, by default it's the page width */
    width?: number;

    /** initial viewport width, by default it's the page height */
    height?: number;

    /** override alignment of the SVG content inside its viewport */
    preserveAspectRatio?: string;

    /** use the CSS styles computed by the browser (for SVGElement only) */
    useCSS?: boolean;

    /** function called to get the fonts, see source code */
    fontCallback?: (
      family: string,
      bold: boolean,
      italic: boolean,
      fontOptions: { fauxItalic: boolean; fauxBold: boolean },
    ) => string;

    /** same as above for the images (for Node.js) */
    imageCallback?: (link: string) => {src: string | Uint8Array, properties?: BitmapProperties };

    /** same as above for the external SVG documents */
    documentCallback?: (
      file: string,
    ) => SVGElement | string | (SVGElement | string)[];

    /** function called to get color, making mapping to CMYK possible */
    colorCallback?: (
      color: RGBColor | CMYKColor,
      raw: string,
    ) => RGBColor | CMYKColor;

    /** function called when there is a warning */
    warningCallback?: (warning: string, error?: unknown) => void;

    /** assume that units are PDF points instead of SVG pixels */
    assumePt?: boolean;

    /** precision factor for approximate calculations (default = 3) */
    precision?: number;
  }

  interface BitmapProperties {
    width: number;
    height: number;
    channels: number;
    colorSpace: string;
    isBitmap: true;
  }
}
