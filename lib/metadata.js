class PDFMetadata {
  constructor() {
    this._body = '';
    this._extraNamespaces = {};
    this._metadata = '';
  }

  registerNamespace(prefix, uri) {
    this._extraNamespaces[prefix] = uri;
  }

  append(xml, newline = true) {
    this._body = this._body.concat(xml);
    if (newline) this._body = this._body.concat('\n');
  }

  getXML() {
    return this._metadata;
  }

  getLength() {
    return this._metadata.length;
  }

  end() {
    const extraNs = Object.entries(this._extraNamespaces)
      .map(([p, u]) => `\n                    xmlns:${p}="${u}"`)
      .join('');

    this._metadata = `
        <?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?>
            <x:xmpmeta xmlns:x="adobe:ns:meta/">
                <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"${extraNs}>
        ${this._body}
                </rdf:RDF>
            </x:xmpmeta>
        <?xpacket end="w"?>
        `.trim();
  }
}

export default PDFMetadata;
