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
});
