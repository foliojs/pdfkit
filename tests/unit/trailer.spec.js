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
        '7 0 obj',
        '<<\n/Producer 8 0 R\n/Creator 9 0 R\n/CreationDate 10 0 R\n>>'
      ],
      ['8 0 obj', '(PDFKit)'],
      ['9 0 obj', '(PDFKit)'],
      ['10 0 obj', '(D:20180201000000Z)'],
      [
        'trailer',
        `<<\n/Size 11\n/Root 2 0 R\n/Info 7 0 R\n/ID [<6d6f636b65642d7064662d6964> <6d6f636b65642d7064662d6964>]\n>>`
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
