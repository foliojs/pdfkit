import PDFDocument from '../../lib/document';
import PDFSecurity from '../../lib/security';
import { logData } from './helpers';
import PDFFontFactory from '../../lib/font_factory';
import fs from 'fs'

// manual mock for PDFSecurity to ensure stored id will be the same accross different systems
PDFSecurity.generateFileID = () => {
  return new Buffer('mocked-pdf-id');
};

describe('AcroForm', () => {
  let doc;

  beforeEach(() => {
    doc = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) }
    });
    doc.pipe(fs.createWriteStream('sample_tmp.pdf'))
  });

  describe('init', () => {
    // test('no fonts', () => {
    //   doc.addPage();

    //   // const docData = logData(doc);

    //   // const font = PDFFontFactory.open(
    //   //   doc,
    //   //   'tests/fonts/Roboto-Regular.ttf'
    //   // );

    //   doc.initAcroForm()
    //   expect(docData.length).toBe(0);
    // });

    test('standard fonts', () => {

      const docData = logData(doc);

      doc.registerFont('myfont1', 'tests/fonts/Roboto-Regular.ttf')

      doc.font('Courier-Bold')    // establishes the default font
      doc.initAcroForm()

      doc.font('myfont1')
        .fontSize(25)
        .text('Test Doc', 0, 20, { width: 612, align: 'center' });
      doc.font('Courier')
        .fontSize(16)
        .text('Courier subheading', 0, 50, { width: 612, align: 'center' });

      doc.font('myfont1').formText('file0', 10, 100, 592, 400, { multiline: true });

      doc.end();

      //expect(docData.length).toBe(2);
    });

    test('field heirarchy', () => {

      // const docData = logData(doc);


      doc.font('Helvetica')    // establishes the default font
      doc.initAcroForm()

      let rootField = doc.field('rootField');
      let child1Field = doc.field('child1Field', { Parent: rootField });
      let child2Field = doc.field('child2Field', { Parent: rootField });
      doc.formText('leaf1', 10, 10, 200, 40, { Parent: child1Field })
      doc.formText('leaf2', 10, 60, 200, 40, { Parent: child1Field })
      doc.formText('leaf3', 10, 110, 200, 40, { Parent: child2Field })

      doc.end();

      //expect(docData.length).toBe(2);
    });
  });
});
