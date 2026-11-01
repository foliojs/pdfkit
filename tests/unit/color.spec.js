import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('color', function () {
  test('normalize', function () {
    const doc = new PDFDocument();

    expect(doc._normalizeColor('#FFF')).toEqual([1, 1, 1]);
    expect(doc._normalizeColor('#FFFFFF')).toEqual([1, 1, 1]);
    expect(doc._normalizeColor('#000')).toEqual([0, 0, 0]);
    expect(doc._normalizeColor('#000000')).toEqual([0, 0, 0]);
    expect(doc._normalizeColor('#6F6FEF')).toEqual([
      0.43529411764705883, 0.43529411764705883, 0.9372549019607843,
    ]);

    expect(doc._normalizeColor([255, 255, 255])).toEqual([1, 1, 1]);
    expect(doc._normalizeColor([255, 255, 255, 255])).toEqual([
      2.55, 2.55, 2.55, 2.55,
    ]);
    expect(doc._normalizeColor([0, 0, 0])).toEqual([0, 0, 0]);
    expect(doc._normalizeColor([0, 0, 0, 0])).toEqual([0, 0, 0, 0]);
    expect(doc._normalizeColor([128, 10, 18])).toEqual([
      0.5019607843137255, 0.0392156862745098, 0.07058823529411765,
    ]);
    expect(doc._normalizeColor([128, 10, 18, 100])).toEqual([
      1.28, 0.1, 0.18, 1,
    ]);
  });

  test('normalize named color case-insensitively', function () {
    const doc = new PDFDocument();

    expect(doc._normalizeColor('red')).toEqual([1, 0, 0]);
    expect(doc._normalizeColor('Red')).toEqual([1, 0, 0]);
    expect(doc._normalizeColor('RED')).toEqual([1, 0, 0]);
  });

  test('normalize with spot color', function () {
    const doc = new PDFDocument();
    doc.addSpotColor('PANTONE 123 C', 0.1, 0.2, 0.3, 0.4);

    const color = doc._normalizeColor('PANTONE 123 C');
    expect(color.id).toEqual('CS0');
    expect(color.values).toEqual([0.1, 0.2, 0.3, 0.4]);
  });

  test('spot color', function () {
    const doc = new PDFDocument();
    const data = logData(doc);
    doc.addSpotColor('PANTONE185C', 0, 100, 78, 9);
    doc.fillColor('PANTONE185C').text('This text uses spot color!');
    doc.end();

    expect(data).toContainChunk([
      `6 0 obj`,
      '<<\n' +
        '/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n' +
        '/ColorSpace <<\n' +
        '/CS0 8 0 R\n' +
        '>>\n' +
        '/Font <<\n' +
        '/F1 9 0 R\n' +
        '>>\n' +
        '>>',
    ]);
  });

  test('spot color escapes color name in Separation color space', function () {
    const doc = new PDFDocument();
    const data = logData(doc);
    doc.addSpotColor('PANTONE 295 C', 100, 53, 0, 67);
    doc.fillColor('PANTONE 295 C').text('This text uses spaced spot color!');
    doc.end();

    expect(data).toContainChunk([
      `8 0 obj`,
      '[/Separation /PANTONE#20295#20C /DeviceCMYK <<\n' +
        '/Range [0 1 0 1 0 1 0 1]\n' +
        '/C0 [0 0 0 0]\n' +
        '/C1 [1 0.53 0 0.67]\n' +
        '/FunctionType 2\n' +
        '/Domain [0 1]\n' +
        '/N 1\n' +
        '>>]',
    ]);
  });
});

describe('save and restore - #1199', () => {
  const colorsOnNewPages = (draw) => {
    const doc = new PDFDocument({ compress: false });
    draw(doc);
    const colors = [];
    const addContent = doc.addContent;
    doc.addContent = function (data) {
      if (/ scn$/.test(data)) colors.push(data);
      return addContent.call(this, data);
    };
    doc.text('lorem '.repeat(3000), { width: 300 });
    return colors;
  };

  test('a color set between them does not reach text on a new page', () => {
    const colors = colorsOnNewPages((doc) => {
      doc.save().rect(0, 0, 10, 10).fill('#f00').restore();
    });
    expect(colors).toEqual([]);
  });

  test('the color from before save is used on new pages', () => {
    const colors = colorsOnNewPages((doc) => {
      doc.fillColor('#00f');
      doc.save().rect(0, 0, 10, 10).fill('#f00').restore();
    });
    expect(colors.length).toBeGreaterThan(0);
    expect(new Set(colors)).toEqual(new Set(['0 0 1 scn']));
  });

  test('a color set without save stays', () => {
    const colors = colorsOnNewPages((doc) => doc.fillColor('#f00'));
    expect(new Set(colors)).toEqual(new Set(['1 0 0 scn']));
  });

  test('nested and unmatched calls keep working', () => {
    const doc = new PDFDocument();
    doc.fillColor('#00f').save().fillColor('#0f0').save().fillColor('#f00');
    doc.restore();
    expect(doc._fillColor[0]).toBe('#0f0');
    doc.restore();
    expect(doc._fillColor[0]).toBe('#00f');
    doc.restore();
    expect(doc._fillColor[0]).toBe('#00f');
  });
});
