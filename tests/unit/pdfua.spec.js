import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('PDF/UA', () => {

    test('metadata is present', () => {
        let options = {
            autoFirstPage: false,
            pdfVersion: '1.7',
            subset: 'PDF/UA',
            tagged: true
        };
        let doc = new PDFDocument(options);
        const data = logData(doc);
        doc.end();
        expect(data).toContainChunk([
            `11 0 obj`,
            `<<\n/length 841\n/Type /Metadata\n/Subtype /XML\n/Length 843\n>>`
        ]);
    });

    test('metadata constains pdfuaid part', () => {
        let options = {
            autoFirstPage: false,
            pdfVersion: '1.7',
            subset: 'PDF/UA',
            tagged: true
        };
        let doc = new PDFDocument(options);
        const data = logData(doc);
        doc.end();
        let metadata = Buffer.from(data[24]).toString();

        expect(metadata).toContain('pdfuaid:part>1');
    });

});