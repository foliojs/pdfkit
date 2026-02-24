import {
  segmentEmojiText,
  isEmojiCodePoint,
  codePoints,
} from '../../lib/emoji/segmenter';

describe('Emoji Segmenter', () => {
  describe('segmentEmojiText', () => {
    test('empty string returns empty array', () => {
      expect(segmentEmojiText('')).toEqual([]);
    });

    test('null/undefined returns empty array', () => {
      expect(segmentEmojiText(null)).toEqual([]);
      expect(segmentEmojiText(undefined)).toEqual([]);
    });

    test('plain text only returns single text segment', () => {
      const result = segmentEmojiText('Hello World');
      expect(result).toEqual([{ type: 'text', text: 'Hello World' }]);
    });

    test('text with no emoji returns single text segment matching input', () => {
      const input = 'The quick brown fox jumps over the lazy dog.';
      const result = segmentEmojiText(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ type: 'text', text: input });
    });

    test('emoji only returns single emoji segment', () => {
      const result = segmentEmojiText('😀');
      expect(result).toEqual([{ type: 'emoji', text: '😀' }]);
    });

    test('mixed text and emoji returns alternating segments', () => {
      const result = segmentEmojiText('Hello 😀 World');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ type: 'text', text: 'Hello ' });
      expect(result[1]).toEqual({ type: 'emoji', text: '😀' });
      expect(result[2]).toEqual({ type: 'text', text: ' World' });
    });

    test('ZWJ sequences grouped as single emoji segment', () => {
      // Family: man, woman, girl, boy (ZWJ sequence)
      const family = '👨\u200D👩\u200D👧\u200D👦';
      const result = segmentEmojiText(family);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('emoji');
      expect(result[0].text).toBe(family);
    });

    test('flag emoji (regional indicator pairs) as single segment', () => {
      // US flag: regional indicator U + regional indicator S
      const usFlag = '🇺🇸';
      const result = segmentEmojiText(usFlag);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('emoji');
      expect(result[0].text).toBe(usFlag);
    });

    test('skin tone modifiers grouped with base emoji', () => {
      // Waving hand + medium skin tone
      const wave = '👋🏽';
      const result = segmentEmojiText(wave);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('emoji');
      expect(result[0].text).toBe(wave);
    });

    test('keycap sequences (digit + VS16 + keycap) as emoji', () => {
      // 1️⃣ = "1" + VS16 + Combining Enclosing Keycap
      const keycap = '1\uFE0F\u20E3';
      const result = segmentEmojiText(keycap);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('emoji');
      expect(result[0].text).toBe(keycap);
    });

    test('variation selector 16 (heart with VS16)', () => {
      // ❤️ = ❤ (U+2764) + VS16 (U+FE0F)
      const heart = '\u2764\uFE0F';
      const result = segmentEmojiText('I ' + heart + ' PDFKit');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ type: 'text', text: 'I ' });
      expect(result[1].type).toBe('emoji');
      expect(result[1].text).toBe(heart);
      expect(result[2]).toEqual({ type: 'text', text: ' PDFKit' });
    });

    test('multiple emoji in a row form consecutive emoji segments', () => {
      const result = segmentEmojiText('🍎🍊🍋');
      // All consecutive emoji should be in emoji segment(s)
      for (const seg of result) {
        expect(seg.type).toBe('emoji');
      }
      const combined = result.map((s) => s.text).join('');
      expect(combined).toBe('🍎🍊🍋');
    });

    test('multiple separate emoji with text between them', () => {
      const result = segmentEmojiText('Hello 😀 World 🎉 Test 🚀');
      expect(result.length).toBeGreaterThanOrEqual(5);
      expect(result[0]).toEqual({ type: 'text', text: 'Hello ' });
      expect(result[1].type).toBe('emoji');
      expect(result[2].type).toBe('text');
      expect(result[3].type).toBe('emoji');
      expect(result[4].type).toBe('text');
    });
  });

  describe('isEmojiCodePoint', () => {
    test('returns true for common emoji code points', () => {
      // 😀 = U+1F600
      expect(isEmojiCodePoint(0x1f600)).toBe(true);
      // 🎉 = U+1F389
      expect(isEmojiCodePoint(0x1f389)).toBe(true);
      // 🚀 = U+1F680
      expect(isEmojiCodePoint(0x1f680)).toBe(true);
      // ❤ = U+2764
      expect(isEmojiCodePoint(0x2764)).toBe(true);
      // ☀ = U+2600
      expect(isEmojiCodePoint(0x2600)).toBe(true);
    });

    test('returns false for ASCII letters and digits', () => {
      // 'A' = 0x41
      expect(isEmojiCodePoint(0x41)).toBe(false);
      // 'z' = 0x7A
      expect(isEmojiCodePoint(0x7a)).toBe(false);
      // '0' = 0x30
      expect(isEmojiCodePoint(0x30)).toBe(false);
      // '9' = 0x39
      expect(isEmojiCodePoint(0x39)).toBe(false);
      // space = 0x20
      expect(isEmojiCodePoint(0x20)).toBe(false);
    });
  });

  describe('codePoints', () => {
    test('correctly handles surrogate pairs (emoji > U+FFFF)', () => {
      // 😀 = U+1F600, encoded as surrogate pair in UTF-16
      const result = codePoints('😀');
      expect(result).toHaveLength(1);
      expect(result[0].cp).toBe(0x1f600);
      expect(result[0].index).toBe(0);
      expect(result[0].length).toBe(2); // surrogate pair = 2 UTF-16 code units
    });

    test('handles basic ASCII', () => {
      const result = codePoints('ABC');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ cp: 0x41, index: 0, length: 1 });
      expect(result[1]).toEqual({ cp: 0x42, index: 1, length: 1 });
      expect(result[2]).toEqual({ cp: 0x43, index: 2, length: 1 });
    });

    test('handles mixed ASCII and emoji', () => {
      const result = codePoints('A😀B');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ cp: 0x41, index: 0, length: 1 });
      expect(result[1]).toEqual({ cp: 0x1f600, index: 1, length: 2 });
      expect(result[2]).toEqual({ cp: 0x42, index: 3, length: 1 });
    });

    test('empty string returns empty array', () => {
      expect(codePoints('')).toEqual([]);
    });
  });
});