import PDFDocument from '../../lib/document';

describe('standard fonts - hyphens and spaces outside WinAnsi', () => {
  const encode = (text) => {
    const doc = new PDFDocument();
    const [encoded, positions] = doc._font.encode(text);
    return { doc, encoded, positions };
  };

  test('narrow no-break space becomes a no-break space - #1071', () => {
    const { encoded, positions } = encode('1\u202f0');
    expect(encoded).toEqual(['31', 'a0', '30']);
    expect(positions[1].advanceWidth).toBe(278);
  });

  test('non-breaking hyphen becomes a hyphen - #1040', () => {
    const { encoded, positions } = encode('a\u2011b');
    expect(encoded).toEqual(['61', '2d', '62']);
    expect(positions[1].advanceWidth).toBe(333);
  });

  test('characters WinAnsi can encode stay the same', () => {
    expect(encode('a\u20ac\u2014\u00e9').encoded).toEqual([
      '61',
      '80',
      '97',
      'e9',
    ]);
  });
});
