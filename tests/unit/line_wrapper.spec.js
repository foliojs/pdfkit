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
});
