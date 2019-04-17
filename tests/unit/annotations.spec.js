const PDFDocument = require('../../lib/document').default;
const PDFSecurity = require('../../lib/security').default;

// manual mock for PDFSecurity to ensure stored id will be the same accross different systems
PDFSecurity.generateFileID = () => {
  return new Buffer('mocked-pdf-id');
};

describe('Annotations', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) }
    });
  });

  describe('link', () => {
    test('using page index', () => {
      document.addPage();

      const dataLog = [];
      document._write = function(data) {
        dataLog.push(data);
      };

      document.text('Go To First Page', { link: 0 });

      const expected = [
        [
          `11 0 obj`,
          `<<
/S /GoTo
/D [7 0 R /XYZ null null null]
>>`
        ]
      ];

      for (let i = 0; i < expected.length; ++i) {
        let idx = dataLog.indexOf(expected[i][0]);
        for (let j = 1; j < expected[i].length; ++j) {
          expect(dataLog[idx + j]).toEqual(expected[i][j]);
        }
      }
    });
  });
});
