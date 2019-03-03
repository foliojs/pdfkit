const PDFFontFactory = require('../../lib/font_factory').default;
const PDFDocument = require('../../lib/document').default;

describe('EmbeddedFont', () => {
  test('no fontLayoutCache option', () => {
    const document = new PDFDocument();
    const font = PDFFontFactory.open(
      document,
      'tests/fonts/Roboto-Regular.ttf'
    );
    const runSpy = jest.spyOn(font, 'layoutRun');

    font.layout('test');
    font.layout('test');
    font.layout('test');
    font.layout('test');

    expect(runSpy).toBeCalledTimes(1);
  });

  test('fontLayoutCache = false', () => {
    const document = new PDFDocument({ fontLayoutCache: false });
    const font = PDFFontFactory.open(
      document,
      'tests/fonts/Roboto-Regular.ttf'
    );
    const runSpy = jest.spyOn(font, 'layoutRun');

    font.layout('test');
    font.layout('test');
    font.layout('test');
    font.layout('test');

    expect(runSpy).toBeCalledTimes(4);
  });
});
