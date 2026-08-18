import PDFDocument from '../../lib/document';
import LineWrapper from '../../lib/line_wrapper';

describe('LineWrapper', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      compress: false,
      margin: 0,
    });
  });

  test('ellipsis is present only on last line of multiline text', () => {
    // There is a weird edge case where ellipsis occurs on lines
    // in the middle of text due to number rounding errors
    //
    // There is probably a simpler combination of values but this is one I found in the wild
    document.y = 402.1999999999999;
    document.fontSize(7.26643598615917);
    const wrapper = new LineWrapper(document, {
      width: 300,
      height: 50.399999999999864,
      ellipsis: true,
    });
    let wrapperOutput = '';
    wrapper.on('line', (buffer) => {
      wrapperOutput += buffer;
      document.y += document.currentLineHeight(true);
    });
    wrapper.wrap('- A\n- B\n- C\n- D\n- E\n- F', {});
    expect(wrapperOutput).toBe('- A\n- B\n- C\n- D\n- E\n- F');
  });

  test('line break is handled correctly when at weird heights', () => {
    // There is probably a simpler combination of values but this is one I found in the wild
    document.y = 1 / 3;
    document.fontSize(Math.fround(42.3 / 3));
    let lineHeight = document.currentLineHeight(true);
    const wrapper = new LineWrapper(document, {
      width: 300,
      height: lineHeight * 3,
    });
    let wrapperOutput = '';
    wrapper.on('line', (buffer) => {
      wrapperOutput += buffer;
      document.y += lineHeight;
    });
    // Limit to 3/4 lines
    wrapper.wrap('A\nB\nC\nD', {});
    expect(wrapperOutput).toBe('A\nB\nC\n');
  });

  test('line break is handled correctly with ellipsis', () => {
    // There is probably a simpler combination of values but this is one I found in the wild
    document.y = 1 / 3;
    document.fontSize(Math.fround(42.3 / 3));
    let lineHeight = document.currentLineHeight(true);
    const wrapper = new LineWrapper(document, {
      width: 300,
      height: lineHeight * 3,
      ellipsis: true,
    });
    let wrapperOutput = '';
    wrapper.on('line', (buffer) => {
      wrapperOutput += buffer;
      document.y += lineHeight;
    });
    // Limit to 3/4 lines
    wrapper.wrap('A\nB\nC\nD', {});
    expect(wrapperOutput).toBe('A\nB\nC…');
  });

  test('emits events in order for a single-line text', () => {
    const wrapper = new LineWrapper(document, { width: 300 });
    const events = [];

    wrapper.on('sectionStart', () => events.push('sectionStart'));
    wrapper.on('firstLine', () => events.push('firstLine'));
    wrapper.on('lastLine', () => events.push('lastLine'));
    wrapper.on('line', () => events.push('line'));
    wrapper.on('sectionEnd', () => events.push('sectionEnd'));

    wrapper.wrap('Hello', {});

    expect(events).toEqual([
      'sectionStart',
      'firstLine',
      'lastLine',
      'line',
      'sectionEnd',
    ]);
  });

  test('emits events in order for a single-line text that triggers a page break', () => {
    const wrapper = new LineWrapper(document, { width: 300 });
    const events = [];

    document.text('at the bottom of the page', 0, 770);

    wrapper.on('sectionStart', () => events.push('sectionStart'));
    wrapper.on('firstLine', () => events.push('firstLine'));
    wrapper.on('lastLine', () => events.push('lastLine'));
    wrapper.on('line', () => {
      events.push('line');
      // mimic line height adjustment
      document.y += document.currentLineHeight(true);
    });
    wrapper.on('sectionEnd', () => events.push('sectionEnd'));

    wrapper.wrap('Hello', {});

    expect(events).toEqual([
      'sectionStart',
      'firstLine',
      'lastLine',
      'line',
      'sectionEnd',
    ]);
  });

  test('emits nested events when content spans in multiple pages', () => {
    const wrapper = new LineWrapper(document, { width: 300 });

    const events = [];

    document.text('near the bottom of the page', 0, 740);

    wrapper.on('sectionStart', () => events.push('sectionStart'));
    wrapper.on('firstLine', () => events.push('firstLine'));
    wrapper.on('lastLine', () => events.push('lastLine'));
    wrapper.on('line', () => {
      events.push('line');
      // mimic line height adjustment
      document.y += document.currentLineHeight(true);
    });
    wrapper.on('sectionEnd', () => events.push('sectionEnd'));

    wrapper.wrap(
      `multiple lines of text that should span across pages`.repeat(4),
      {},
    );

    expect(events).toEqual([
      'sectionStart',
      'firstLine',
      'line',
      'line',
      'sectionEnd',
      'sectionStart',
      'line',
      'line',
      'lastLine',
      'line',
      'sectionEnd',
    ]);
  });

  test('emits columnBreak then pageBreak on overflow', () => {
    // Set near bottom so first line triggers a section change immediately
    const lh = document.currentLineHeight(true);
    document.y = document.page.maxY() - lh + 0.5;

    const wrapper = new LineWrapper(document, { width: 300, columns: 2 });

    let columnBreaks = 0;
    let pageBreaks = 0;
    wrapper.on('columnBreak', () => columnBreaks++);
    wrapper.on('pageBreak', () => pageBreaks++);

    // First wrap should overflow to the next column
    wrapper.wrap('A', {});
    expect(columnBreaks).toBeGreaterThanOrEqual(1);

    // Move near bottom again; second overflow should create a new page
    document.y = document.page.maxY() - lh + 0.5;
    wrapper.wrap('B', {});
    expect(pageBreaks).toBeGreaterThanOrEqual(1);
  });

  test('indentAllLines indents every paragraph by the same amount', () => {
    const options = { width: 300, indent: 50, indentAllLines: true };
    const wrapper = new LineWrapper(document, options);

    const geometry = [];
    wrapper.on('line', () => {
      geometry.push({ x: document.x, lineWidth: wrapper.lineWidth });
      document.y += document.currentLineHeight(true);
    });

    wrapper.wrap('alpha\nbravo\ncharlie', options);

    // the indent is only taken back off after the first line when
    // indentAllLines is false, so each paragraph used to add another indent
    // on top of the previous one
    expect(geometry).toEqual([
      { x: 50, lineWidth: 250 },
      { x: 50, lineWidth: 250 },
      { x: 50, lineWidth: 250 },
    ]);
  });

  test('indentAllLines keeps the same line width across page breaks', () => {
    const options = { width: 300, indent: 50, indentAllLines: true };
    const wrapper = new LineWrapper(document, options);

    const breaks = [];
    wrapper.on('pageBreak', () => {
      breaks.push({ x: document.x, lineWidth: wrapper.lineWidth });
    });
    wrapper.on('line', () => {
      document.y += document.currentLineHeight(true);
    });

    wrapper.wrap('word '.repeat(1200), options);

    // lineWidth carries over between pages, so subtracting the indent again
    // on every page break narrowed the text column further and further
    expect(breaks.length).toBeGreaterThan(1);
    breaks.forEach((geometry) => {
      expect(geometry).toEqual({ x: 50, lineWidth: 250 });
    });
  });

  test('indentAllLines does not double the indent when a page break comes first', () => {
    const options = { width: 300, indent: 50, indentAllLines: true };
    // start near the bottom so the orphan check starts a new page before the
    // first line is emitted, running the page break before firstLine
    document.y = document.page.maxY() - 2;
    const wrapper = new LineWrapper(document, options);

    let firstLineGeometry = null;
    wrapper.on('line', () => {
      if (firstLineGeometry === null) {
        firstLineGeometry = { x: document.x, lineWidth: wrapper.lineWidth };
      }
      document.y += document.currentLineHeight(true);
    });

    wrapper.wrap('word '.repeat(20), options);

    expect(firstLineGeometry).toEqual({ x: 50, lineWidth: 250 });
  });

  test('indentAllLines keeps the indent when the text is continued', () => {
    const geometry = [];
    const line = document._line;
    document._line = function (text, options, wrapper) {
      geometry.push({ x: document.x, lineWidth: wrapper && wrapper.lineWidth });
      return line.call(this, text, options, wrapper);
    };

    const sentence = 'lorem ipsum dolor sit amet consectetur adipiscing ';
    const paragraph = sentence.repeat(4);
    document.text(paragraph, {
      width: 300,
      indent: 15,
      indentAllLines: true,
      continued: true,
    });
    const continuedFrom = geometry.length;
    document.text(paragraph, { width: 300 });

    // continued options are inherited, so the second call is also
    // indentAllLines: its first line carries on from where the previous
    // segment ended, and every line after that keeps the paragraph indent
    geometry.slice(0, continuedFrom).forEach((line) => {
      expect(line).toEqual({ x: 15, lineWidth: 285 });
    });

    const continued = geometry.slice(continuedFrom);
    expect(continued.length).toBeGreaterThan(1);
    expect(continued[0].x).toBeGreaterThan(15);
    continued.slice(1).forEach((line) => {
      expect(line).toEqual({ x: 15, lineWidth: 285 });
    });
  });
});
