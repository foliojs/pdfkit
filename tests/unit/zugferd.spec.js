import PDFDocument from '../../lib/document';
import { logData } from './helpers';
import { readFileSync } from 'fs';
import { vi } from 'vitest';

function makeDoc() {
  return new PDFDocument({
    autoFirstPage: false,
    compress: false,
    pdfVersion: '1.7',
    subset: 'PDF/A-3b',
  });
}

function getMetadata(data) {
  const buf = data.find(
    (v) =>
      typeof v !== 'string' &&
      Buffer.isBuffer(v) &&
      v.toString().includes('x:xmpmeta'),
  );
  return buf ? buf.toString() : null;
}

function loadXML(name) {
  return readFileSync(new URL(`./einvoices/${name}`, import.meta.url));
}

const XML = Buffer.from('<Invoice/>');

describe('einvoice guards', () => {
  test('throws on unsupported format', () => {
    const doc = makeDoc();
    logData(doc);
    expect(() => doc.einvoice('ubl', XML)).toThrow(
      'Unsupported e-invoice format: "ubl"',
    );
  });

  test('unsupported format does not lock the document', () => {
    const doc = makeDoc();
    const data = logData(doc);
    expect(() => doc.einvoice('ubl', XML)).toThrow();
    // should succeed after the failed attempt
    expect(() => doc.einvoice('zugferd', XML)).not.toThrow();
    doc.end();
    const filespec = data.find(
      (v) =>
        typeof v === 'string' && v.includes('/AFRelationship /Alternative'),
    );
    expect(filespec).toBeDefined();
  });

  test('throws when src is null', () => {
    const doc = makeDoc();
    logData(doc);
    expect(() => doc.einvoice('zugferd', null)).toThrow(
      'einvoice: src is required',
    );
  });

  test('throws when src is undefined', () => {
    const doc = makeDoc();
    logData(doc);
    expect(() => doc.einvoice('zugferd', undefined)).toThrow(
      'einvoice: src is required',
    );
  });

  test('throws when einvoice is called a second time', () => {
    const doc = makeDoc();
    logData(doc);
    doc.einvoice('zugferd', XML);
    expect(() => doc.einvoice('zugferd', XML)).toThrow(
      'An e-invoice has already been embedded in this document',
    );
  });

  test('warns when subset is not PDF/A-3', () => {
    const doc = new PDFDocument({
      autoFirstPage: false,
      compress: false,
      pdfVersion: '1.7',
      subset: 'PDF/A-2b',
    });
    logData(doc);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    doc.einvoice('zugferd', XML);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('PDF/A-3 is required'),
    );
    warn.mockRestore();
  });

  test('does not warn when subset is PDF/A-3b', () => {
    const doc = makeDoc();
    logData(doc);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    doc.einvoice('zugferd', XML);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('does not warn when subset is PDF/A-3a', () => {
    const doc = new PDFDocument({
      autoFirstPage: false,
      compress: false,
      pdfVersion: '1.7',
      subset: 'PDF/A-3a',
    });
    logData(doc);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    doc.einvoice('zugferd', XML);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('does not warn when subset is PDF/A-3 (no conformance suffix)', () => {
    const doc = new PDFDocument({
      autoFirstPage: false,
      compress: false,
      pdfVersion: '1.7',
      subset: 'PDF/A-3',
    });
    logData(doc);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    doc.einvoice('zugferd', XML);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('returns the embedded filespec reference', () => {
    const doc = makeDoc();
    logData(doc);
    const filespec = doc.einvoice('zugferd', XML);
    expect(filespec).toBeDefined();
    expect(filespec).not.toBeNull();
  });
});

describe('zugferd', () => {
  test('embeds the XML with AFRelationship Alternative', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('zugferd', XML);
    doc.end();

    const filespec = data.find(
      (v) =>
        typeof v === 'string' && v.includes('/AFRelationship /Alternative'),
    );
    expect(filespec).toBeDefined();
    expect(filespec).toContain('/F (zugferd-invoice.xml)');

    const embeddedFile = data.find(
      (v) => typeof v === 'string' && v.includes('/Type /EmbeddedFile'),
    );
    expect(embeddedFile).toContain('/Subtype /text#2Fxml');
  });

  test('XMP contains pdfaExtension schema declaration', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('zugferd', XML);
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain('pdfaExtension:schemas');
    expect(xmp).toContain(
      'urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#',
    );
    expect(xmp).toContain('pdfaProperty:name>DocumentFileName');
    expect(xmp).toContain('pdfaProperty:name>ConformanceLevel');
  });

  test('XMP contains fx invoice values', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('zugferd', XML, { profile: 'XRECHNUNG', version: '1.0' });
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain('<fx:DocumentType>INVOICE</fx:DocumentType>');
    expect(xmp).toContain(
      '<fx:DocumentFileName>xrechnung.xml</fx:DocumentFileName>',
    );
    expect(xmp).toContain(
      '<fx:ConformanceLevel>XRECHNUNG</fx:ConformanceLevel>',
    );
    expect(xmp).toContain('<fx:Version>1.0</fx:Version>');
  });

  test('defaults to EN 16931 profile', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('zugferd', XML);
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain(
      '<fx:ConformanceLevel>EN 16931</fx:ConformanceLevel>',
    );
    expect(xmp).toContain('<fx:Version>2.4</fx:Version>');
  });

  test('XRECHNUNG profile uses xrechnung.xml filename and version 3.0', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('zugferd', XML, { profile: 'XRECHNUNG' });
    doc.end();

    const filespec = data.find(
      (v) =>
        typeof v === 'string' && v.includes('/AFRelationship /Alternative'),
    );
    expect(filespec).toContain('/F (xrechnung.xml)');

    const xmp = getMetadata(data);
    expect(xmp).toContain(
      '<fx:DocumentFileName>xrechnung.xml</fx:DocumentFileName>',
    );
    expect(xmp).toContain('<fx:Version>3.0</fx:Version>');
  });

  test('documentType defaults to INVOICE', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('zugferd', XML);
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain('<fx:DocumentType>INVOICE</fx:DocumentType>');
  });

  test('documentType can be overridden via options', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('zugferd', XML, { documentType: 'ORDER' });
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain('<fx:DocumentType>ORDER</fx:DocumentType>');
  });

  test('AF catalog entry is present', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('zugferd', XML);
    doc.end();

    const catalog = data.find(
      (v) => typeof v === 'string' && v.includes('/Type /Catalog'),
    );
    expect(catalog).toContain('/AF');
  });

  describe('per-profile embed with real XML fixtures', () => {
    test.each([
      ['minimum', 'MINIMUM', 'zugferd-invoice.xml', '2.4', 'minimum.xml'],
      ['basic wl', 'BASIC WL', 'zugferd-invoice.xml', '2.4', 'basic-wl.xml'],
      ['basic', 'BASIC', 'zugferd-invoice.xml', '2.4', 'basic.xml'],
      ['en 16931', 'EN 16931', 'zugferd-invoice.xml', '2.4', 'en16931.xml'],
      ['extended', 'EXTENDED', 'zugferd-invoice.xml', '2.4', 'extended.xml'],
      [
        'xrechnung',
        'XRECHNUNG',
        'xrechnung.xml',
        '3.0',
        'zugferd-xrechnung.xml',
      ],
    ])(
      'profile "%s" : ConformanceLevel "%s", filename "%s", version "%s"',
      (profile, label, filename, version, xmlFile) => {
        const doc = makeDoc();
        const data = logData(doc);
        doc.einvoice('zugferd', loadXML(xmlFile), { profile });
        doc.end();

        const xmp = getMetadata(data);
        expect(xmp).toContain(
          `<fx:ConformanceLevel>${label}</fx:ConformanceLevel>`,
        );
        expect(xmp).toContain(
          `<fx:DocumentFileName>${filename}</fx:DocumentFileName>`,
        );
        expect(xmp).toContain(`<fx:Version>${version}</fx:Version>`);

        const filespec = data.find(
          (v) =>
            typeof v === 'string' && v.includes('/AFRelationship /Alternative'),
        );
        expect(filespec).toContain(`/F (${filename})`);
      },
    );
  });

  describe('case-insensitive profile lookup', () => {
    test.each([
      ['MINIMUM', 'MINIMUM'],
      ['Basic', 'BASIC'],
      ['BASIC WL', 'BASIC WL'],
      ['Basic Wl', 'BASIC WL'],
      ['EN 16931', 'EN 16931'],
      ['Extended', 'EXTENDED'],
      ['XRechnung', 'XRECHNUNG'],
      ['XRECHNUNG', 'XRECHNUNG'],
    ])(
      'profile input "%s" resolves to ConformanceLevel "%s"',
      (input, label) => {
        const doc = makeDoc();
        const data = logData(doc);
        doc.einvoice('zugferd', XML, { profile: input });
        doc.end();

        const xmp = getMetadata(data);
        expect(xmp).toContain(
          `<fx:ConformanceLevel>${label}</fx:ConformanceLevel>`,
        );
      },
    );
  });

  test('unknown profile falls back to EN 16931', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('zugferd', loadXML('en16931.xml'), {
      profile: 'UNSUPPORTED_PROFILE',
    });
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain(
      '<fx:ConformanceLevel>EN 16931</fx:ConformanceLevel>',
    );
    expect(xmp).toContain(
      '<fx:DocumentFileName>zugferd-invoice.xml</fx:DocumentFileName>',
    );
    expect(xmp).toContain('<fx:Version>2.4</fx:Version>');
  });
});
