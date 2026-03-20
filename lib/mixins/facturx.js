const FACTURX_NS = 'urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#';

const PROFILES = {
  minimum: {
    label: 'MINIMUM',
    filename: 'factur-x.xml',
    version: '1.0',
  },
  'basic wl': {
    label: 'BASIC WL',
    filename: 'factur-x.xml',
    version: '1.0',
  },
  basic: { label: 'BASIC', filename: 'factur-x.xml', version: '1.0' },
  'en 16931': {
    label: 'EN 16931',
    filename: 'factur-x.xml',
    version: '1.0',
  },
  extended: {
    label: 'EXTENDED',
    filename: 'factur-x.xml',
    version: '1.0',
  },
};

export default {
  /**
   * Embed a Factur-X XML invoice alongside the required XMP metadata.
   * @param {Buffer | ArrayBuffer | string} src XML invoice data to embed (Buffer, ArrayBuffer, base64 data-URI or path to file)
   * @param {object} options
   *  * options.profile: the conformance profile 'minimum' or 'basic wl' or 'basic' or 'en 16931' or 'extended' (default: 'en 16931')
   *  * options.version: override for spec version that is written to the metadata, each conformance profile has a built-in default
   *  * options.documentType: the document type written to the metadata 'INVOICE' or 'ORDER' or 'ORDER_RESPONSE' or 'ORDER_CHANGE' (default: 'INVOICE')
   * @returns filespec reference
   */
  embedFacturX(src, options = {}) {
    const profile =
      PROFILES[options.profile?.toLowerCase()] ?? PROFILES['en 16931'];
    const version = options.version || profile.version;
    const documentType = options.documentType || 'INVOICE';

    this.registerXMPNamespace('fx', FACTURX_NS);

    const filespec = this.file(src, {
      name: profile.filename,
      type: 'text/xml',
      relationship: 'Alternative',
    });

    this.appendXML(
      _getSchema(profile.filename, profile.label, version, documentType),
    );

    return filespec;
  },
};

function _getSchema(filename, profile, version, documentType) {
  return `
        <rdf:Description rdf:about=""
            xmlns:pdfaExtension="http://www.aiim.org/pdfa/ns/extension/"
            xmlns:pdfaSchema="http://www.aiim.org/pdfa/ns/schema#"
            xmlns:pdfaProperty="http://www.aiim.org/pdfa/ns/property#">
            <pdfaExtension:schemas>
                <rdf:Bag>
                    <rdf:li rdf:parseType="Resource">
                        <pdfaSchema:schema>Factur-X PDFA Extension Schema</pdfaSchema:schema>
                        <pdfaSchema:namespaceURI>${FACTURX_NS}</pdfaSchema:namespaceURI>
                        <pdfaSchema:prefix>fx</pdfaSchema:prefix>
                        <pdfaSchema:property>
                            <rdf:Seq>
                                <rdf:li rdf:parseType="Resource">
                                    <pdfaProperty:name>DocumentFileName</pdfaProperty:name>
                                    <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                                    <pdfaProperty:category>external</pdfaProperty:category>
                                    <pdfaProperty:description>The name of the embedded XML document</pdfaProperty:description>
                                </rdf:li>
                                <rdf:li rdf:parseType="Resource">
                                    <pdfaProperty:name>DocumentType</pdfaProperty:name>
                                    <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                                    <pdfaProperty:category>external</pdfaProperty:category>
                                    <pdfaProperty:description>The type of the embedded XML document</pdfaProperty:description>
                                </rdf:li>
                                <rdf:li rdf:parseType="Resource">
                                    <pdfaProperty:name>Version</pdfaProperty:name>
                                    <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                                    <pdfaProperty:category>external</pdfaProperty:category>
                                    <pdfaProperty:description>The version of the Factur-X standard used</pdfaProperty:description>
                                </rdf:li>
                                <rdf:li rdf:parseType="Resource">
                                    <pdfaProperty:name>ConformanceLevel</pdfaProperty:name>
                                    <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                                    <pdfaProperty:category>external</pdfaProperty:category>
                                    <pdfaProperty:description>The conformance level of the Factur-X standard used</pdfaProperty:description>
                                </rdf:li>
                            </rdf:Seq>
                        </pdfaSchema:property>
                    </rdf:li>
                </rdf:Bag>
            </pdfaExtension:schemas>
        </rdf:Description>
        <rdf:Description rdf:about=""
          xmlns:fx="${FACTURX_NS}">
            <fx:DocumentType>${documentType}</fx:DocumentType>
            <fx:DocumentFileName>${filename}</fx:DocumentFileName>
            <fx:Version>${version}</fx:Version>
            <fx:ConformanceLevel>${profile}</fx:ConformanceLevel>
        </rdf:Description>
        `;
}
