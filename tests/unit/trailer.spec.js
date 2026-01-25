import PDFDocument from '../../lib/document';
import PDFSecurity from '../../lib/security';
import { logData } from './helpers';

// manual mock for PDFSecurity to ensure stored id will be the same accross different systems
PDFSecurity.generateFileID = () => {
  return Buffer.from('mocked-pdf-id');
};

describe('Document trailer', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
    });
  });

  test('', () => {
    const docData = logData(document);
    document.end();
    expect(docData).toContainChunk([
      '8 0 obj',
      '<<\n/Producer 9 0 R\n/Creator 10 0 R\n/CreationDate 11 0 R\n>>',
    ]);
    expect(docData).toContainChunk(['9 0 obj', '(PDFKit)']);
    expect(docData).toContainChunk(['10 0 obj', '(PDFKit)']);
    expect(docData).toContainChunk(['11 0 obj', '(D:20180201000000Z)']);
    expect(docData).toContainChunk([
      'trailer',
      `<<\n/Size 12\n/Root 3 0 R\n/Info 8 0 R\n/ID [<6d6f636b65642d7064662d6964> <6d6f636b65642d7064662d6964>]\n>>`,
    ]);
  });

  test('written empty data of destinations', () => {
    const docData = logData(document);
    document.end();
    expect(docData).toContainChunk([
      '2 0 obj',
      '<<\n/Dests <<\n  /Names [\n]\n>>\n>>',
    ]);
  });

  test('written data of destinations', () => {
    const docData = logData(document);
    document.addNamedDestination('LINK1');
    document.addNamedDestination('LINK2', 'FitH', 100);
    document.addNamedDestination('LINK3', 'XYZ', 36, 36, 50);
    document.goTo(10, 10, 100, 20, 'LINK1');
    document.end();

    expect(docData).toContainChunk([
      '2 0 obj',
      `<<
/Dests <<
  /Limits [(LINK1) (LINK3)]
  /Names [
    (LINK1) [7 0 R /XYZ null null null]
    (LINK2) [7 0 R /FitH 100]
    (LINK3) [7 0 R /XYZ 36 756 50]
]
>>
>>`,
    ]);
    expect(docData).toContainChunk([
      '7 0 obj',
      `<<
/Type /Page
/Parent 1 0 R
/MediaBox [0 0 612 792]
/Contents 5 0 R
/Resources 6 0 R
/UserUnit 1
/Annots [9 0 R]
>>`,
    ]);
  });
});
