import PDFDocument from '../../lib/document';
import PDFFontFactory from '../../lib/font_factory';
import { logData } from './helpers';

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

  describe('emebed', () => {
    test('sets BaseName based on font id and postscript name', () => {
      const document = new PDFDocument();
      const font = PDFFontFactory.open(
        document,
        'tests/fonts/Roboto-Regular.ttf',
        undefined,
        'F1099'
      );
      const dictionary = {
        end: () => {},
      };
      font.dictionary = dictionary;
      font.embed();

      expect(dictionary.data.BaseFont).toBe('BAJJZZ+Roboto-Regular');
    });
  });

  describe.only('toUnicodeMap', () => {
    test('bfrange lines should not cross highcode boundary', () => {
      const doc = new PDFDocument({ compress: false });
      const font = PDFFontFactory.open(
        doc,
        'tests/fonts/Roboto-Regular.ttf',
        undefined,
        'F1099'
      );

      // 398 different glyphs
      font.encode('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      font.encode('abcdefghijklmnopqrstuvwxyz');
      font.encode('ÁÀÂÄÅÃÆÇÐÉÈÊËÍÌÎÏÑÓÒÔÖÕØŒÞÚÙÛÜÝŸ');
      font.encode('áàâäãåæçðéèêëíìîïıñóòôöõøœßþúùûüýÿ');
      font.encode('ĀĂĄĆČĎĐĒĖĘĚĞĢĪĮİĶŁĹĻĽŃŅŇŌŐŔŖŘŠŚŞȘŢȚŤŪŮŰŲŽŹŻ');
      font.encode('āăąćčďđēėęěğģīįķłĺļľńņňōőŕŗřšśşșţțťūůűųžźż');
      font.encode('ΑΒΓ∆ΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΆΈΉΊΌΎΏΪΫ');
      font.encode('αβγδεζηθικλµνξοπρςστυφχψωάέήίόύώϊϋΐΰ');
      font.encode('АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ');
      font.encode('абвгдежзийклмнопрстуфхцчшщъыьэюя');
      font.encode('ЀЁЂЃЄЅІЇЈЉЊЋЌЍЎЏҐӁҒҖҚҢҮҰҲҶҺӘӢӨӮ');
      font.encode('ѐёђѓєѕіїјљњћќѝўџґӂғҗқңүұҳҷһәӣөӯ');

      const docData = logData(doc);
      font.toUnicodeCmap();
      const text = docData.map((d) => d.toString("utf8")).join("");

      let glyphs = 0
      for (const block of text.matchAll(/beginbfrange\n((?:.|\n)*?)\nendbfrange/g)) {
        for (const line of block[1].matchAll(/^<([0-9a-f]+)>\s+<([0-9a-f]+)>\s+\[/igm)) {
          const low = parseInt(line[1], 16);
          const high = parseInt(line[2], 16);
          glyphs += high - low + 1;
          expect(high & 0xFFFFFF00).toBe(low & 0xFFFFFF00);
        }
      }

      expect(glyphs).toBe(398 + 1);
    });
  });
});
