import zugferd from './zugferd';
import facturx from './facturx';

export default {
  _importFormat(format) {
    Object.assign(this, format);
  },

  /**
   * Attach an electronic invoice and its required metadata.
   * @param {string} format invoice format identifier (e.g. 'zugferd', 'facturx')
   * @param {Buffer | ArrayBuffer | string} src invoice data to embed (Buffer, ArrayBuffer, base64 encoded string or path to file)
   * @param {object} options format-specific options, see documentation for each supported format for details on required and optional fields
   */
  einvoice(format, src, options = {}) {
    if (this._einvoiceEmbedded) {
      throw new Error(
        'An e-invoice has already been embedded in this document',
      );
    }

    if (!src) {
      throw new Error('einvoice: src is required');
    }

    if (this.subset !== 3) {
      const current = this.subset ? `PDF/A-${this.subset}` : 'none';
      console.warn(
        `einvoice: PDF/A-3 is required for e-invoice compliance (current subset: ${current})`,
      );
    }

    switch (format.toLowerCase()) {
      case 'zugferd':
        this._einvoiceEmbedded = true;
        this._importFormat(zugferd);
        return this.embedZugferd(src, options);
      case 'facturx':
        this._einvoiceEmbedded = true;
        this._importFormat(facturx);
        return this.embedFacturX(src, options);
      default:
        throw new Error(`Unsupported e-invoice format: "${format}"`);
    }
  },
};
