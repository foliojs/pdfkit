import PDFMetadata from "../metadata"
import { sfix } from "../string"

export default {
    initMetadata() {
        this.metadata = new PDFMetadata();
    },

    appendXML(xml, tabs = 0, newline = true) {
        tabs += 2
        xml = xml.split('\n').map(x => ' '.repeat(4).repeat(tabs) + x).join('\n');
        this.metadata.append(xml, newline);
    },

    _addInfo() {
        this.appendXML(
            sfix`
            <rdf:Description rdf:about=""
                    xmlns:xmp="http://ns.adobe.com/xap/1.0/"
                    xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
                    xmlns:dc="http://purl.org/dc/elements/1.1/">`,
            0,
        );
        this.appendXML(
            sfix`
            <xmp:CreateDate>${this.info.CreationDate.toISOString().split('.')[0] + 'Z'}</xmp:CreateDate>`,
            1,
        );
        if (this.info.Creator) {
            this.appendXML(
                sfix`
                <xmp:CreatorTool>${this.info.Creator}</xmp:CreatorTool>`,
                1,
            );
        }

        if (this.info.Title) {
            this.appendXML(
                sfix`
                <dc:title>
                    <rdf:Alt>
                        <rdf:li xml:lang="x-default">${this.info.Title}</rdf:li>
                    </rdf:Alt>
                </dc:title>`,
                1,
            );
        }

        if (this.info.Author) {
            this.appendXML(
                sfix`
                <dc:creator>
                    <rdf:Seq>
                        <rdf:li>${this.info.Author}</rdf:li>
                    </rdf:Seq>
                </dc:creator>`,
                1,
            );
        }

        if (this.info.Subject) {
            this.appendXML(
                sfix`
                <dc:description>
                    <rdf:Alt>
                        <rdf:li xml:lang="x-default">${this.info.Subject}</rdf:li>
                    </rdf:Alt>
                </dc:description>`,
                1,
            );
        }

        if (this.info.Producer) {
            this.appendXML(
                sfix`
                <pdf:Producer>${this.info.Producer}</pdf:Producer>`,
                1,
            );
        }

        if (this.info.Keywords) {
            this.appendXML(
                sfix`
                <pdf:Keywords>${this.info.Keywords}</pdf:Keywords>`,
                1,
            );
        }

        this.appendXML(
            sfix`
            </rdf:Description>`,
            0,
        );
    },

    endMetadata() {
        this._addInfo();

        this.metadata.end();

        /*
        Metadata was introduced in PDF 1.4, so adding it to 1.3 
        will likely only take up more space.
        */
        if (this.version != 1.3) {
            this.metadataRef = this.ref({
                length: this.metadata.getLength(),
                Type: 'Metadata',
                Subtype: 'XML'
            });
            this.metadataRef.compress = false;
            this.metadataRef.write(Buffer.from(this.metadata.getXML(), 'utf-8'));
            this.metadataRef.end();
            this._root.data.Metadata = this.metadataRef;
        }
    }
}