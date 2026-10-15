import PDFDocument from '../../lib/document';
import { toBytes } from '../../lib/output';

async function finish(doc) {
  const bytes = toBytes(doc);
  doc.end();
  return new TextDecoder().decode(await bytes);
}

describe('document information in XMP', () => {
  test.each(['Title', 'Author', 'Subject', 'Keywords', 'Creator', 'Producer'])(
    'escapes %s without changing the original information',
    async (key) => {
      const value = `R&D <draft> "quoted" 'text' &amp; ]]>`;
      const doc = new PDFDocument({
        pdfVersion: '1.7',
        info: { [key]: value },
      });
      const pdf = await finish(doc);
      const xml = pdf.match(/<x:xmpmeta[\s\S]*?<\/x:xmpmeta>/)[0];
      expect(xml).toContain(
        'R&amp;D &lt;draft&gt; &quot;quoted&quot; &apos;text&apos; &amp;amp; ]]&gt;',
      );
      expect(doc.info[key]).toBe(value);
    },
  );

  test('omits invalid XML characters and preserves Unicode and whitespace', async () => {
    const valid = 'A\tB\nC\rD 中文 😀 \uD7FF\uE000\uFFFD';
    const invalid =
      '\u0000\u0001\u0008\u000B\u000C\u000E\u001F\uFFFE\uFFFF\uD800x\uDC00';
    const doc = new PDFDocument({
      pdfVersion: '1.7',
      info: { Title: valid + invalid },
    });
    const pdf = await finish(doc);
    expect(pdf).toContain(
      `<rdf:li xml:lang="x-default">${valid.replace('\r', '&#xD;')}x</rdf:li>`,
    );
    expect(doc.info.Title).toBe(valid + invalid);
  });

  test('escapes the latest values while preserving explicitly appended XML', async () => {
    const doc = new PDFDocument({
      pdfVersion: '1.7',
      info: { Title: 'original' },
    });
    const xml =
      '<rdf:Description rdf:about="" xmlns:test="urn:test"><test:value>A&amp;B</test:value></rdf:Description>';
    doc.appendXML(xml);
    doc.info.Title = 'Updated & <final>';
    const pdf = await finish(doc);
    expect(pdf).toContain(xml);
    expect(pdf).toContain('Updated &amp; &lt;final&gt;</rdf:li>');
  });

  test.each([
    { pdfVersion: '1.4', subset: 'PDF/A-1', marker: 'pdfaid:part' },
    {
      pdfVersion: '1.7',
      subset: 'PDF/UA',
      tagged: true,
      marker: 'pdfuaid:part',
    },
  ])(
    'preserves the $subset metadata structure',
    async ({ marker, ...options }) => {
      const doc = new PDFDocument({ ...options, info: { Title: 'R&D' } });
      const pdf = await finish(doc);
      expect(pdf).toContain(`<${marker}>1</${marker}>`);
      expect(pdf).toContain('R&amp;D</rdf:li>');
    },
  );

  test('does not emit XMP in PDF 1.3', async () => {
    const doc = new PDFDocument({ pdfVersion: '1.3', info: { Title: 'R&D' } });
    expect(await finish(doc)).not.toContain('<x:xmpmeta');
    expect(doc.info.Title).toBe('R&D');
  });
});
