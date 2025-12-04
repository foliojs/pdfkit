import PDFDocument from '../../lib/document';
import PDFAnnotationReference from '../../lib/structure_annotation';
import { logData } from './helpers';

describe('PDFAnnotationReference', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      compress: false,
      tagged: true,
    });
  });

  test('should add annotation reference to structure element with StructParent', () => {
    const docData = logData(document);

    const linkElement = document.struct('Link');
    document.addStructure(linkElement);

    const annotRef = document.ref({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [100, 100, 200, 120],
    });

    linkElement.add(new PDFAnnotationReference(annotRef));
    linkElement.end();
    annotRef.end();
    document.end();

    const dataStr = docData.join('\n');
    expect(dataStr).toContain('/Type /OBJR');
    expect(dataStr).toContain('/StructParent 0');
  });

  test('should handle multiple annotations with different StructParent values', () => {
    const docData = logData(document);

    const section = document.struct('Sect');
    document.addStructure(section);

    const link1 = document.struct('Link');
    const link2 = document.struct('Link');
    section.add(link1);
    section.add(link2);

    const annotRef1 = document.ref({ Type: 'Annot', Subtype: 'Link' });
    const annotRef2 = document.ref({ Type: 'Annot', Subtype: 'Link' });

    link1.add(new PDFAnnotationReference(annotRef1));
    link2.add(new PDFAnnotationReference(annotRef2));

    link1.end();
    link2.end();
    section.end();
    annotRef1.end();
    annotRef2.end();
    document.end();

    const dataStr = docData.join('\n');
    expect(dataStr).toContain('/StructParent 0');
    expect(dataStr).toContain('/StructParent 1');
  });
});
