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

  describe('toUnicodeMap', () => {
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

    test('beginbfrange count should match actual number of ranges', () => {
      const doc = new PDFDocument({ compress: false });
      const font = PDFFontFactory.open(
        doc,
        'tests/fonts/Roboto-Regular.ttf',
        undefined,
        'F1099'
      );

      // Generate more than 256 unique characters to trigger multiple bfrange entries
      // Each chunk is 256 characters, so we need >256 to get multiple ranges
      const chars = [];
      
      // Add ASCII characters (0-127)
      for (let i = 32; i < 127; i++) {
        chars.push(String.fromCharCode(i));
      }
      
      // Add extended Latin characters (128-255)
      for (let i = 160; i < 256; i++) {
        chars.push(String.fromCharCode(i));
      }
      
      // Add additional Unicode characters to exceed 256
      const additionalChars = 'ÁÀÂÄÅÃÆÇÐÉÈÊËÍÌÎÏÑÓÒÔÖÕØŒÞÚÙÛÜÝŸáàâäãåæçðéèêëíìîïıñóòôöõøœßþúùûüýÿĀĂĄĆČĎĐĒĖĘĚĞĢĪĮİĶŁĹĻĽŃŅŇŌŐŔŖŘŠŚŞȘŢȚŤŪŮŰŲŽŹŻāăąćčďđēėęěğģīįķłĺļľńņňōőŕŗřšśşșţțťūůűųžźż';
      
      const allChars = chars.join('') + additionalChars;
      font.encode(allChars);

      const docData = logData(doc);
      font.toUnicodeCmap();
      const text = docData.map((d) => d.toString("utf8")).join("");

      // Extract the count declaration from "N beginbfrange"
      const beginbfrangeMatch = text.match(/(\d+)\s+beginbfrange/);
      expect(beginbfrangeMatch).not.toBeNull();
      const declaredCount = parseInt(beginbfrangeMatch[1], 10);

      // Count actual bfrange entries
      let actualRangeCount = 0;
      const bfrangeBlockMatch = text.match(/beginbfrange\n((?:.|\n)*?)\nendbfrange/);
      if (bfrangeBlockMatch) {
        const bfrangeContent = bfrangeBlockMatch[1];
        // Match each bfrange line: <start> <end> [entries]
        const rangeMatches = bfrangeContent.matchAll(/^<([0-9a-f]+)>\s+<([0-9a-f]+)>\s+\[/gm);
        for (const match of rangeMatches) {
          actualRangeCount++;
        }
      }

      // The declared count must match the actual number of ranges
      expect(declaredCount).toBe(actualRangeCount);
      expect(actualRangeCount).toBeGreaterThan(1); // Should have multiple ranges when >256 chars
    });

    test('beginbfrange count should be 1 for fonts with <=256 characters', () => {
      const doc = new PDFDocument({ compress: false });
      const font = PDFFontFactory.open(
        doc,
        'tests/fonts/Roboto-Regular.ttf',
        undefined,
        'F1099'
      );

      // Generate exactly 256 characters
      const chars = [];
      for (let i = 0; i < 256; i++) {
        chars.push(String.fromCharCode(i + 32)); // Start from space (32) to avoid control chars
      }
      font.encode(chars.join(''));

      const docData = logData(doc);
      font.toUnicodeCmap();
      const text = docData.map((d) => d.toString("utf8")).join("");

      // Extract the count declaration
      const beginbfrangeMatch = text.match(/(\d+)\s+beginbfrange/);
      expect(beginbfrangeMatch).not.toBeNull();
      const declaredCount = parseInt(beginbfrangeMatch[1], 10);

      // Count actual bfrange entries
      let actualRangeCount = 0;
      const bfrangeBlockMatch = text.match(/beginbfrange\n((?:.|\n)*?)\nendbfrange/);
      if (bfrangeBlockMatch) {
        const bfrangeContent = bfrangeBlockMatch[1];
        const rangeMatches = bfrangeContent.matchAll(/^<([0-9a-f]+)>\s+<([0-9a-f]+)>\s+\[/gm);
        for (const match of rangeMatches) {
          actualRangeCount++;
        }
      }

      // For <=256 characters, should have exactly 1 range
      expect(declaredCount).toBe(1);
      expect(actualRangeCount).toBe(1);
      expect(declaredCount).toBe(actualRangeCount);
    });
  });
});
