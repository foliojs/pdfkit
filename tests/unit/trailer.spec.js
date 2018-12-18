const PDFDocument = require('../../');

describe('Document trailer', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({info: { CreationDate: new Date(Date.UTC(2018,1,1)) } });
  });

  test('', (done) => {
    const dataLog = [];
    const expected = [
      [
        '7 0 obj',
        '<<\n/Producer 8 0 R\n/Creator 9 0 R\n/CreationDate 10 0 R\n>>'
      ],
      [
        '8 0 obj',
        '(PDFKit)'
      ],
      [
        '9 0 obj',
        '(PDFKit)'
      ],
      [
        '10 0 obj',
        '(D:20180201000000Z)'
      ],
      [
        'trailer',
        `<<\n/Size 11\n/Root 2 0 R\n/Info 7 0 R\n/ID [<8c72cf48ff87daac57e26bf1550e6979> <8c72cf48ff87daac57e26bf1550e6979>]\n>>`
      ]
    ];
    document._write = function(data) {
      dataLog.push(data)
    }
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