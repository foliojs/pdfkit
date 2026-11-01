import PDFDocument from '../../lib/document';
import { vi } from 'vitest';
import { logData, parseTextStreams } from './helpers';

describe('Text', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      compress: false,
    });
  });

  describe('text', () => {
    test('with simple content', () => {
      const docData = logData(document);

      document.text('simple text');
      document.end();

      expect(docData).toContainText({ text: 'simple text' });
    });

    test('with wordSpacing keeps consecutive line breaks - #1034', () => {
      const lineYs = (options) => {
        const doc = new PDFDocument({ compress: false });
        const docData = logData(doc);
        doc.text('Test\n\nText', 100, 300, options);
        doc.end();
        return [...docData.join('\n').matchAll(/1 0 0 1 100 (\S+) Tm/g)].map(
          (match) => match[1],
        );
      };

      expect(lineYs({ wordSpacing: 5 })).toEqual(lineYs({}));
      expect(lineYs({ wordSpacing: 5 })).toHaveLength(2);
    });

    test('with wordSpacing still collapses spaces within a line', () => {
      const docData = logData(document);

      document.text('one   two', { wordSpacing: 5 });
      document.end();

      expect(docData.join('\n')).toContain(
        '[<6f6e65> -694.666667 <7477> 10 <6f> -694.666667] TJ',
      );
    });

    test('with a tab or carriage return keeps the following characters', () => {
      const docData = logData(document);

      document.text('a\tb\rc', { lineBreak: false });
      document.end();

      expect(docData).toContainText({ text: 'a\tb\rc' });
    });

    test('with destination', () => {
      // just check that there is no exception
      document.text('simple text', { destination: 'anchor' });
    });

    test('with content ending after page right margin', () => {
      const docData = logData(document);

      const textStream = Buffer.from(
        `1 0 0 -1 0 792 cm
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 600 763.384 Tm
/F1 12 Tf
[<73696d706c65207465> 30 <7874> 0] TJ
ET
Q
`,
        'binary',
      );

      document.text('simple text', 600, 20);
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 117
>>`,
        `stream`,
        textStream,
        `\nendstream`,
        `endobj`,
      ]);
    });

    test('with line too thin to contain a single character', () => {
      const docData = logData(document);

      const text = 'simple text';
      const textStream = Buffer.from(
        `1 0 0 -1 0 792 cm
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 773.384 Tm
/F1 12 Tf
[<73> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 759.512 Tm
/F1 12 Tf
[<69> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 745.64 Tm
/F1 12 Tf
[<6d> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 731.768 Tm
/F1 12 Tf
[<70> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 717.896 Tm
/F1 12 Tf
[<6c> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 704.024 Tm
/F1 12 Tf
[<65> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 690.152 Tm
/F1 12 Tf
[<2074> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 676.28 Tm
/F1 12 Tf
[<65> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 662.408 Tm
/F1 12 Tf
[<78> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 648.536 Tm
/F1 12 Tf
[<74> 0] TJ
ET
Q
`,
        'binary',
      );

      // before this test, this case used to make the code run into an infinite loop.
      // To handle regression gracefully and avoid sticking this test into an infinite loop,
      // we look out for a side effect of this infinite loop, witch is adding an infinite number of pages.
      // Normally, there should not be any page added to the document.

      document.on('pageAdded', () => {
        const pageRange = document.bufferedPageRange();
        const newPageIndex = pageRange.start + pageRange.count;
        // We try restrict the fail condition to only infinite loop, so we wait for several pages to be added.
        if (newPageIndex > 10) {
          throw new Error('Infinite loop detected');
        }
      });

      document.text(text, 10, 10, { width: 2 });
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 738
>>`,
        `stream`,
        textStream,
        `\nendstream`,
        `endobj`,
      ]);
    });

    test('bounded text precision - issue #1611', () => {
      const docData = logData(document);
      const text = 'New york';
      const bounds = document.boundsOfString(text);
      // Draw text which is constrained to the bounds
      document.text(text, {
        ellipsis: true,
        width: bounds.width,
        height: bounds.height,
      });

      document.end();

      expect(docData).toContainText({ text });
    });

    test('with null x coordinate', () => {
      const docData = logData(document);

      document.text('text with null x', null, 50);
      document.end();

      expect(docData).toContainText({ text: 'text with null x' });
    });

    test.each([
      ['underline', { underline: true }],
      ['strike', { strike: true }],
      ['link', { link: 'http://example.com/' }],
      ['goTo', { goTo: 'anchor' }],
    ])('with lineBreak false and %s', (_name, extraOptions) => {
      const docData = logData(document);

      document.text('no line break', 50, 50, {
        lineBreak: false,
        ...extraOptions,
      });
      document.end();

      expect(docData).toContainText({ text: 'no line break' });
    });

    test.each(['underline', 'strike'])(
      '%s follows the baseline option',
      (decoration) => {
        // y is the top of the text with the default baseline and the baseline
        // itself with 'alphabetic', so the line has to move up by the ascent
        const lineY = (doc, baseline) => {
          const moveTo = vi.spyOn(doc, 'moveTo');
          doc.text('baseline', 50, 50, {
            lineBreak: false,
            [decoration]: true,
            baseline,
          });
          return moveTo.mock.calls.at(-1)[1];
        };
        const other = new PDFDocument({ compress: false });
        const ascent = (document._font.ascender / 1000) * document._fontSize;

        expect(lineY(other, 'alphabetic')).toBeCloseTo(
          lineY(document, 'top') - ascent,
          5,
        );
      },
    );

    test.each([
      ['characterSpacing', { characterSpacing: 4 }, '184.74'],
      ['wordSpacing', { wordSpacing: 5 }, '138.74'],
    ])('underline of wrapped text with %s', (_name, spacing, end) => {
      const docData = logData(document);
      const options = { width: 400, underline: true, ...spacing };
      const bounds = document.boundsOfString(
        'Hello big world',
        50,
        50,
        options,
      );

      document.text('Hello big world', 50, 50, options);
      document.end();

      // the same width as with lineBreak false, with each spacing counted once
      expect(bounds.width.toFixed(2)).toBe((end - 50).toFixed(2));
      expect(docData).toContainChunk([
        'stream',
        new RegExp(`50 [\\d.]+ m\n${end.replace('.', '\\.')}\\d* [\\d.]+ l`),
      ]);
    });

    test('bounds of text with wordSpacing keep consecutive line breaks - #1034', () => {
      const text = 'Test\n\nText';

      expect(document.boundsOfString(text, { wordSpacing: 5 }).height).toBe(
        document.boundsOfString(text).height,
      );
    });

    test('bounds of text with lineBreak false and wordSpacing', () => {
      const docData = logData(document);
      const options = { lineBreak: false, underline: true, wordSpacing: 5 };
      const bounds = document.boundsOfString(
        'Hello big world',
        50,
        50,
        options,
      );

      document.text('Hello big world', 50, 50, options);
      document.end();

      // as wide as the underline, which includes the word spacing
      expect(bounds.width.toFixed(2)).toBe('88.74');
      expect(docData).toContainChunk([
        'stream',
        /50 [\d.]+ m\n138\.74\d* [\d.]+ l/,
      ]);
    });

    test.each([
      ['center', { characterSpacing: 4 }, '182.628', '317.372'],
      ['center', { wordSpacing: 5 }, '205.628', '294.372'],
      ['right', { wordSpacing: 5 }, '361.256', '450'],
    ])('%s aligned text with %o', (align, spacing, start, end) => {
      const docData = logData(document);

      document.text('Hello big world', 50, 50, {
        width: 400,
        align,
        underline: true,
        ...spacing,
      });
      document.end();

      // the underline spans the drawn text, so it sits in the middle of the
      // line or ends at its right edge
      const escape = (n) => n.replace('.', '\\.');
      expect(docData).toContainChunk([
        'stream',
        new RegExp(
          `${escape(start)}\\d* [\\d.]+ m\n${escape(end)}\\d* [\\d.]+ l`,
        ),
      ]);
    });
    test('with lineBreak whitespace a hyphenated word moves to the next line whole', () => {
      const lines = [];
      const line = document._line;
      document._line = function (text, options, wrapper) {
        lines.push(text);
        return line.call(this, text, options, wrapper);
      };
      const width = document.widthOfString('a design-system') - 1;

      document.text('a design-system', { width, lineBreak: 'whitespace' });

      expect(lines).toEqual(['a ', 'design-system']);
    });

    test('a continued segment can switch to lineBreak whitespace', () => {
      const lines = [];
      const line = document._line;
      document._line = function (text, options, wrapper) {
        lines.push(text);
        return line.call(this, text, options, wrapper);
      };
      const width = document.widthOfString('a design-system') - 1;

      document.text('a ', { width, continued: true });
      document.text('design-system', { lineBreak: 'whitespace' });

      // a continued segment whose first word does not fit emits an empty
      // line to move down before the word
      expect(lines.filter(Boolean)).toEqual(['a ', 'design-system']);
    });
  });

  describe('heightOfString', () => {
    // Every string drawn by a TJ operator in the captured output, decoded with
    // the shared test helper, so a measured string merged into another line is
    // caught.
    const drawnTexts = (data) =>
      data
        .filter((item) => Buffer.isBuffer(item))
        .flatMap((item) => parseTextStreams(item.toString('utf8')))
        .map((stream) => stream.text);

    test('after a continued text call does not draw the measured string - issue #1284', () => {
      const docData = logData(document);

      document.text('abc', 0, 0, { continued: true });
      document.heightOfString('X');
      document.end();

      expect(docData).toContainText({ text: 'abc' });
      expect(docData).not.toContainText({ text: 'X' });
      expect(drawnTexts(docData).join('')).not.toContain('X');
    });

    test('after a finished text call does not draw the measured string', () => {
      const docData = logData(document);

      document.text('abc', 0, 0);
      document.heightOfString('X');
      document.end();

      expect(docData).toContainText({ text: 'abc' });
      expect(docData).not.toContainText({ text: 'X' });
      expect(drawnTexts(docData).join('')).not.toContain('X');
    });

    test('with the continued option still draws the next text call', () => {
      const docData = logData(document);

      // a measurement with continued: true must not leave a wrapper behind
      // that stops the next text call from being drawn
      document.text('abc', 0, 0, { continued: true });
      document.heightOfString('X', { continued: true });
      document.text('def');
      document.end();

      expect(docData).toContainText({ text: 'abc' });
      expect(docData).toContainText({ text: 'def' });
    });

    test('without line wrapping preserves the next text position', () => {
      const docData = logData(document);
      const nextX = document.widthOfString('abc');

      document.text('abc', 0, 0, { continued: true });
      document.heightOfString('X', { lineBreak: false, width: null });
      document.text('def');
      document.end();

      expect(docData).toContainText({ text: 'abc', x: 0 });
      expect(docData).toContainText({ text: 'def', x: nextX });
      expect(drawnTexts(docData).join('')).not.toContain('X');
    });
  });

  describe('text with structure parent links', () => {
    beforeEach(() => {
      document = new PDFDocument({
        info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
        compress: false,
        tagged: true,
      });
    });

    test('should auto-link text inside Link structure element', () => {
      const docData = logData(document);

      const linkElement = document.struct('Link', () => {
        document.text('Click here', 100, 100, {
          link: 'http://example.com',
        });
      });

      document.addStructure(linkElement);
      linkElement.end();
      document.end();

      const dataStr = docData.join('\n');
      expect(dataStr).toContain('/S /Link');
      expect(dataStr).toContain('/StructParent');
    });

    test('should not add StructParent outside Link structure', () => {
      const docData = logData(document);

      document.text('Click here', 100, 100, {
        link: 'http://example.com',
      });

      document.end();

      const dataStr = docData.join('\n');
      expect(dataStr).toContain('/Subtype /Link');
      expect(dataStr).not.toContain('/StructParent');
    });

    test('should not leak link options to subsequent structure elements with continued text', () => {
      const docData = logData(document);

      const paragraph = document.struct('P');
      document.addStructure(paragraph);

      paragraph.add(
        document.struct('Span', () => {
          document.text('This is some text before ', 100, 100, {
            continued: true,
          });
        }),
      );

      paragraph.add(
        document.struct('Link', () => {
          document.text('Here is a link!', {
            link: 'http://google.com/',
            underline: true,
            continued: true,
          });
        }),
      );

      paragraph.add(
        document.struct('Span', () => {
          document.text(' and this is text after the link.');
        }),
      );

      paragraph.end();
      document.end();

      const dataStr = docData.join('\n');

      // Count how many link annotations exist - should be exactly 1
      const linkMatches = dataStr.match(/\/Subtype \/Link/g);
      expect(linkMatches).toBeTruthy();
      expect(linkMatches.length).toBe(1);

      expect(dataStr).toContain('/S /Span');
      expect(dataStr).toContain('/S /Link');
    });
  });
});

describe('width of drawn lines - #1174', () => {
  const X = 72;

  const draw = (doc, text, options, next) => {
    const lines = [];
    const fragment = doc._fragment;
    doc._fragment = function (line, x, y, opts) {
      lines.push({ text: line });
      return fragment.call(this, line, x, y, opts);
    };
    const addContent = doc.addContent;
    doc.addContent = function (data) {
      const line = lines[lines.length - 1];
      const start = /^1 0 0 1 ([\d.-]+) [\d.-]+ Tm$/.exec(data);
      if (start) line.x = Number(start[1]);
      const from = /^([\d.-]+) [\d.-]+ m$/.exec(data);
      if (from) line.underlineFrom = Number(from[1]);
      const to = /^([\d.-]+) [\d.-]+ l$/.exec(data);
      if (to) line.underlineTo = Number(to[1]);
      return addContent.call(this, data);
    };
    doc.text(text, X, 72, options);
    if (next) doc.text(next, options.next);
    return lines;
  };
  const newDoc = () => new PDFDocument({ compress: false });
  const wrapped = 'hello world this is a long line of text that wraps here';

  test('center ignores the space at the end of a wrapped line', () => {
    const doc = newDoc();
    const [first, second] = draw(doc, wrapped, { width: 150, align: 'center' });
    const center = (text) => X + (150 - doc.widthOfString(text)) / 2;
    expect(first.text.endsWith(' ')).toBe(true);
    expect(first.x).toBeCloseTo(center(first.text.trimEnd()), 2);
    expect(second.x).toBeCloseTo(center(second.text), 2);
  });

  test('center ignores it with characterSpacing', () => {
    const doc = newDoc();
    const options = { width: 200, align: 'center', characterSpacing: 4 };
    const [first] = draw(doc, wrapped, options);
    const width = doc.widthOfString(first.text.trimEnd(), options);
    expect(first.x).toBeCloseTo(X + (200 - width) / 2, 2);
  });

  test.each([
    ['center', (width) => X + (300 - width) / 2],
    ['right', (width) => X + 300 - width],
  ])('%s counts one gap for a hyphenated word', (align, expected) => {
    const doc = newDoc();
    const [line] = draw(doc, 'a well-known fact', {
      width: 300,
      align,
      wordSpacing: 5,
      underline: true,
    });
    const width = doc.widthOfString('a well-known fact') + 2 * 5;
    expect(line.x).toBeCloseTo(expected(width), 2);
    expect(line.underlineFrom).toBeCloseTo(line.x, 2);
    expect(line.underlineTo).toBeCloseTo(line.x + width, 2);
  });

  test('center counts the hyphen that replaces a soft hyphen', () => {
    const doc = newDoc().font('tests/fonts/Roboto-Regular.ttf');
    const part = 'a'.repeat(30);
    const [line] = draw(doc, `${part}­${part}`, {
      width: 200,
      align: 'center',
    });
    expect(line.text.endsWith('-')).toBe(true);
    expect(line.x).toBeCloseTo(X + (200 - doc.widthOfString(line.text)) / 2, 2);
  });

  test('a justified underline stays inside the line', () => {
    const doc = newDoc();
    const [line] = draw(
      doc,
      'a well-known and well-known fact about well-known things',
      { width: 200, align: 'justify', underline: true },
    );
    expect(line.underlineTo).toBeCloseTo(X + 200, 0);
  });

  test.each([[0], [5]])(
    'an underline stops at the last glyph with wordSpacing %d',
    (wordSpacing) => {
      const doc = newDoc();
      const [line] = draw(doc, wrapped, {
        width: 150,
        underline: true,
        wordSpacing,
      });
      const visible = line.text.trim();
      const gaps = visible.split(/\s+/).length - 1;
      expect(line.underlineTo).toBeCloseTo(
        X + doc.widthOfString(visible) + gaps * wordSpacing,
        2,
      );
    },
  );

  test('an underline runs on into a continued segment', () => {
    const doc = newDoc();
    const [first, second] = draw(
      doc,
      'hello ',
      {
        width: 300,
        underline: true,
        continued: true,
        next: { underline: true },
      },
      'world',
    );
    expect(first.underlineTo).toBeCloseTo(second.underlineFrom, 2);
  });

  test('an underline keeps the trailing space with lineBreak false', () => {
    const doc = newDoc();
    const [line] = draw(doc, 'hello ', { lineBreak: false, underline: true });
    expect(line.underlineTo).toBeCloseTo(X + doc.widthOfString('hello '), 2);
  });

  test('a continued segment counts each gap once with wordSpacing', () => {
    const doc = newDoc();
    const options = {
      width: 300,
      wordSpacing: 5,
      continued: true,
      next: { wordSpacing: 5 },
    };
    const [first, second] = draw(doc, 'a b ', options, 'c');
    expect(second.x - first.x).toBeCloseTo(
      doc.widthOfString('a b ') + 2 * 5,
      2,
    );
  });

  test('a line of only whitespace has no width', () => {
    const doc = newDoc();
    expect(doc._drawnWidth('   ', 0, {})).toBe(0);
    expect(doc._drawnWidth('   ', 5, {})).toBe(0);
  });
});
