import PDFDocument from '../../lib/document';

describe('color', function() {
  test('normalize', function() {
    const doc = new PDFDocument();

    expect(doc._normalizeColor('#FFF')).toEqual([1, 1, 1]);
    expect(doc._normalizeColor('#FFFFFF')).toEqual([1, 1, 1]);
    expect(doc._normalizeColor('#000')).toEqual([0, 0, 0]);
    expect(doc._normalizeColor('#000000')).toEqual([0, 0, 0]);
    expect(doc._normalizeColor('#6F6FEF')).toEqual([
      0.43529411764705883,
      0.43529411764705883,
      0.9372549019607843
    ]);

    expect(doc._normalizeColor([255, 255, 255])).toEqual([1, 1, 1]);
    expect(doc._normalizeColor([255, 255, 255, 255])).toEqual([
      2.55,
      2.55,
      2.55,
      2.55
    ]);
    expect(doc._normalizeColor([0, 0, 0])).toEqual([0, 0, 0]);
    expect(doc._normalizeColor([0, 0, 0, 0])).toEqual([0, 0, 0, 0]);
    expect(doc._normalizeColor([128, 10, 18])).toEqual([
      0.5019607843137255,
      0.0392156862745098,
      0.07058823529411765
    ]);
    expect(doc._normalizeColor([128, 10, 18, 100])).toEqual([
      1.28,
      0.1,
      0.18,
      1
    ]);
  });

  test('normalize with spot color', function() {
    const doc = new PDFDocument();
    doc.addSpotColor('PANTONE 123 C', 0.1, 0.2, 0.3, 0.4);

    const color = doc._normalizeColor('PANTONE 123 C');
    expect(color.id).toEqual('CS0');
    expect(color.values).toEqual([0.1, 0.2, 0.3, 0.4]);
  });
});
