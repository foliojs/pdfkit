const PDFDocument = require('../../lib/document').default;
const PDFSecurity = require('../../lib/security').default;

// manual mock for PDFSecurity to ensure stored id will be the same accross different systems
PDFSecurity.generateFileID = () => {
  return new Buffer('mocked-pdf-id');
};

describe('Document trailer', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) }
    });
  });

  test('', done => {
    const dataLog = [];
    const expected = [
      [
        '8 0 obj',
        '<<\n/Producer 9 0 R\n/Creator 10 0 R\n/CreationDate 11 0 R\n>>'
      ],
      ['9 0 obj', '(PDFKit)'],
      ['10 0 obj', '(PDFKit)'],
      ['11 0 obj', '(D:20180201000000Z)'],
      [
        'trailer',
        `<<\n/Size 12\n/Root 3 0 R\n/Info 8 0 R\n/ID [<6d6f636b65642d7064662d6964> <6d6f636b65642d7064662d6964>]\n>>`
      ]
    ];
    document._write = function(data) {
      dataLog.push(data);
    };
    document.end();
    setTimeout(() => {
      for (let i = 0; i < expected.length; ++i) {
        let idx = dataLog.indexOf(expected[i][0]);
        for (let j = 1; j < expected[i].length; ++j) {
          expect(dataLog[idx + j]).toEqual(expected[i][j]);
        }
      }
      done();
    }, 1);
  });

  test('written empty data of destinations', done => {
    const dataLog = [];
    const expected = [
      ['2 0 obj', '<<\n/Dests <<\n  /Names [\n]\n>>\n>>'],
    ];
    document._write = function(data) {
      dataLog.push(data);
    };
    document.end();
    setTimeout(() => {
      for (let i = 0; i < expected.length; ++i) {
        let idx = dataLog.indexOf(expected[i][0]);
        for (let j = 1; j < expected[i].length; ++j) {
          expect(dataLog[idx + j]).toEqual(expected[i][j]);
        }
      }
      done();
    }, 1);
  });

  test('written data of destinations', done => {
    document.addNamedDestination('LINK1');
    document.addNamedDestination('LINK2', 'FitH', 100);
    document.addNamedDestination('LINK3', 'XYZ', 36, 36, 50);

    const dataLog = [];
    const expected = [
      [
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
>>`
      ]
    ];
    document._write = function(data) {
      dataLog.push(data);
    };
    document.end();
    setTimeout(() => {
      for (let i = 0; i < expected.length; ++i) {
        let idx = dataLog.indexOf(expected[i][0]);
        for (let j = 1; j < expected[i].length; ++j) {
          expect(dataLog[idx + j]).toEqual(expected[i][j]);
        }
      }
      done();
    }, 1);
  });
});
