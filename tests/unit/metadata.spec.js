import PDFMetadata from '../../lib/metadata';

describe('PDFMetadata', () => {
  let metadata;
  beforeEach(() => {
    metadata = new PDFMetadata();
  });

  test('body is empty on initialisation', () => {
    expect(metadata._body).toBe('');
    expect(metadata._metadata).toBe('');
    expect(metadata.getLength()).toBe(0);
    expect(metadata.getXML()).toBe('');
  });

  test('contains appended XML after end()', () => {
    const xml = `
        <dc:title>
            <rdf:Alt>
                <rdf:li xml:lang="x-default">Test</rdf:li>
            </rdf:Alt>
        </dc:title>
        `;
    metadata.append(xml);
    metadata.end();
    expect(metadata.getXML()).toContain(xml);
  });

  test('end() produces a non-empty complete XML document', () => {
    metadata.end();
    const xml = metadata.getXML();
    expect(xml).toContain('<?xpacket');
    expect(xml).toContain('rdf:RDF');
    expect(xml).toContain('</rdf:RDF>');
    expect(xml).toContain('</x:xmpmeta>');
    expect(metadata.getLength()).toBeGreaterThan(0);
  });

  test('registered namespaces appear on the rdf:RDF opening tag', () => {
    metadata.registerNamespace(
      'fx',
      'urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#',
    );
    metadata.end();
    const xml = metadata.getXML();
    // extract just the rdf:RDF opening tag (may span multiple lines)
    const rdfOpenTag = xml.match(/<rdf:RDF[\s\S]*?>/)[0];
    expect(rdfOpenTag).toContain(
      'xmlns:fx="urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#"',
    );
  });

  test('multiple registered namespaces all appear on rdf:RDF', () => {
    metadata.registerNamespace(
      'fx',
      'urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#',
    );
    metadata.registerNamespace('zf', 'urn:zugferd:example#');
    metadata.end();
    const rdfOpenTag = metadata.getXML().match(/<rdf:RDF[\s\S]*?>/)[0];
    expect(rdfOpenTag).toContain('xmlns:fx=');
    expect(rdfOpenTag).toContain('xmlns:zf=');
  });

  test('no extra namespaces leaves rdf:RDF tag unchanged', () => {
    metadata.end();
    const rdfLine = metadata
      .getXML()
      .split('\n')
      .find((l) => l.includes('rdf:RDF'));
    expect(rdfLine).not.toContain('xmlns:fx=');
  });
});
