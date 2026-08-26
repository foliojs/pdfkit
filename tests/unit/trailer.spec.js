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

  test('writes null for XYZ parameters left off, rather than a NaN top', () => {
    const docData = logData(document);
    document.addNamedDestination('LINK1', 'XYZ', 36);
    document.end();

    expect(docData).toContainChunk([
      '2 0 obj',
      `<<
/Dests <<
  /Names [
    (LINK1) [7 0 R /XYZ 36 null null]
]
>>
>>`,
    ]);
  });

  test('fills out a short parameter list for the types that allow null', () => {
    const docData = logData(document);
    document.addNamedDestination('LINK1', 'XYZ', 36, 36);
    document.addNamedDestination('LINK2', 'FitH');
    document.addNamedDestination('LINK3', 'FitV');
    document.addNamedDestination('LINK4', 'FitBH');
    document.addNamedDestination('LINK5', 'FitBV');
    document.end();

    expect(docData).toContainChunk([
      '2 0 obj',
      `<<
/Dests <<
  /Limits [(LINK1) (LINK5)]
  /Names [
    (LINK1) [7 0 R /XYZ 36 756 null]
    (LINK2) [7 0 R /FitH null]
    (LINK3) [7 0 R /FitV null]
    (LINK4) [7 0 R /FitBH null]
    (LINK5) [7 0 R /FitBV null]
]
>>
>>`,
    ]);
  });

  test('drops parameters beyond the list a destination type takes', () => {
    const docData = logData(document);
    document.addNamedDestination('LINK1', 'Fit', 99);
    document.addNamedDestination('LINK2', 'FitB', 99);
    document.addNamedDestination('LINK3', 'XYZ', 1, 2, 3, 4);
    document.addNamedDestination('LINK4', 'FitR', 1, 2, 3, 4, 5);
    document.end();

    expect(docData).toContainChunk([
      '2 0 obj',
      `<<
/Dests <<
  /Limits [(LINK1) (LINK4)]
  /Names [
    (LINK1) [7 0 R /Fit]
    (LINK2) [7 0 R /FitB]
    (LINK3) [7 0 R /XYZ 1 790 3]
    (LINK4) [7 0 R /FitR 1 2 3 4]
]
>>
>>`,
    ]);
  });

  // FitR is the one type whose parameters may not be null, so a short one is left as it
  // was given rather than filled out. It is still not a valid destination; resizing it is
  // out of scope here.
  test('leaves a short FitR destination as it was given', () => {
    const docData = logData(document);
    document.addNamedDestination('LINK1', 'FitR', 1, 2, 3);
    document.end();

    expect(docData).toContainChunk([
      '2 0 obj',
      `<<
/Dests <<
  /Names [
    (LINK1) [7 0 R /FitR 1 2 3]
]
>>
>>`,
    ]);
  });
});
