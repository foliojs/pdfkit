import PDFDocument from '../../lib/document';
import { logData } from './helpers';
import { readFileSync } from 'fs';

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

describe('facturx', () => {
  test('embeds the XML with AFRelationship Alternative', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('facturx', XML);
    doc.end();

    const filespec = data.find(
      (v) =>
        typeof v === 'string' && v.includes('/AFRelationship /Alternative'),
    );
    expect(filespec).toBeDefined();
    expect(filespec).toContain('/F (factur-x.xml)');

    const embeddedFile = data.find(
      (v) => typeof v === 'string' && v.includes('/Type /EmbeddedFile'),
    );
    expect(embeddedFile).toContain('/Subtype /text#2Fxml');
  });

  test('XMP contains pdfaExtension schema declaration', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('facturx', XML);
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain('pdfaExtension:schemas');
    expect(xmp).toContain('Factur-X PDFA Extension Schema');
    expect(xmp).toContain(
      'urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#',
    );
    expect(xmp).toContain('pdfaProperty:name>DocumentFileName');
    expect(xmp).toContain('pdfaProperty:name>ConformanceLevel');
  });

  test('XMP contains fx invoice values', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('facturx', XML, { profile: 'BASIC', version: '1.0' });
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain('<fx:DocumentType>INVOICE</fx:DocumentType>');
    expect(xmp).toContain(
      '<fx:DocumentFileName>factur-x.xml</fx:DocumentFileName>',
    );
    expect(xmp).toContain('<fx:ConformanceLevel>BASIC</fx:ConformanceLevel>');
    expect(xmp).toContain('<fx:Version>1.0</fx:Version>');
  });

  test('defaults to EN 16931 profile with version 1.0', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('facturx', XML);
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain(
      '<fx:ConformanceLevel>EN 16931</fx:ConformanceLevel>',
    );
    expect(xmp).toContain('<fx:Version>1.0</fx:Version>');
  });

  test('profile option sets ConformanceLevel in XMP', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('facturx', XML, { profile: 'EXTENDED' });
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain(
      '<fx:ConformanceLevel>EXTENDED</fx:ConformanceLevel>',
    );
    expect(xmp).toContain(
      '<fx:DocumentFileName>factur-x.xml</fx:DocumentFileName>',
    );
  });

  test('version can be overridden via options', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('facturx', XML, { version: '1.0.07' });
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain('<fx:Version>1.0.07</fx:Version>');
  });

  test('documentType defaults to INVOICE', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('facturx', XML);
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain('<fx:DocumentType>INVOICE</fx:DocumentType>');
  });

  test('documentType can be overridden via options', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('facturx', XML, { documentType: 'ORDER' });
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain('<fx:DocumentType>ORDER</fx:DocumentType>');
  });

  test('AF catalog entry is present', () => {
    const doc = makeDoc();
    const data = logData(doc);
    doc.einvoice('facturx', XML);
    doc.end();

    const catalog = data.find(
      (v) => typeof v === 'string' && v.includes('/Type /Catalog'),
    );
    expect(catalog).toContain('/AF');
  });

  describe('per-profile embed with real XML fixtures', () => {
    test.each([
      ['minimum', 'MINIMUM', 'factur-x.xml', '1.0', 'minimum.xml'],
      ['basic wl', 'BASIC WL', 'factur-x.xml', '1.0', 'basic-wl.xml'],
      ['basic', 'BASIC', 'factur-x.xml', '1.0', 'basic.xml'],
      ['en 16931', 'EN 16931', 'factur-x.xml', '1.0', 'en16931.xml'],
      ['extended', 'EXTENDED', 'factur-x.xml', '1.0', 'extended.xml'],
    ])(
      'profile "%s" : ConformanceLevel "%s", filename "%s", version "%s"',
      (profile, label, filename, version, xmlFile) => {
        const doc = makeDoc();
        const data = logData(doc);
        doc.einvoice('facturx', loadXML(xmlFile), { profile });
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
      ['EXTENDED', 'EXTENDED'],
    ])(
      'profile input "%s" resolves to ConformanceLevel "%s"',
      (input, label) => {
        const doc = makeDoc();
        const data = logData(doc);
        doc.einvoice('facturx', XML, { profile: input });
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
    doc.einvoice('facturx', loadXML('en16931.xml'), {
      profile: 'UNSUPPORTED_PROFILE',
    });
    doc.end();

    const xmp = getMetadata(data);
    expect(xmp).toContain(
      '<fx:ConformanceLevel>EN 16931</fx:ConformanceLevel>',
    );
    expect(xmp).toContain(
      '<fx:DocumentFileName>factur-x.xml</fx:DocumentFileName>',
    );
    expect(xmp).toContain('<fx:Version>1.0</fx:Version>');
  });
});
