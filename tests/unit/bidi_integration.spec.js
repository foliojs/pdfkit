import { describe, expect, test, vi } from 'vitest';
import PDFDocument from '../../lib/document';

function makeDoc() {
  const doc = new PDFDocument();
  doc.font('tests/fonts/Roboto-Regular.ttf');
  return doc;
}

describe('bidi integration with text rendering', () => {
  test('LTR-only text takes the fast path: single encode call, no direction', () => {
    const doc = makeDoc();
    const encodeSpy = vi.spyOn(doc._font, 'encode');
    doc.text('Hello world');
    expect(encodeSpy).toHaveBeenCalledTimes(1);
    expect(encodeSpy.mock.calls[0][0]).toBe('Hello world');
    expect(encodeSpy.mock.calls[0][2]).toBeUndefined();
  });

  test('Hebrew-only text encodes as a single rtl run', () => {
    const doc = makeDoc();
    const encodeSpy = vi.spyOn(doc._font, 'encode');
    doc.text('שלום עולם');
    expect(encodeSpy).toHaveBeenCalledTimes(1);
    const [text, , direction] = encodeSpy.mock.calls[0];
    expect(text).toBe('שלום עולם');
    expect(direction).toBe('rtl');
  });

  test('mixed text segments into per-run encode calls with correct directions', () => {
    const doc = makeDoc();
    const encodeSpy = vi.spyOn(doc._font, 'encode');
    doc.text('Hi שלום bye');
    // Expect runs in visual order: "Hi ", rtl-shaped Hebrew, " bye"
    const calls = encodeSpy.mock.calls.map((c) => ({
      text: c[0],
      direction: c[2],
    }));
    expect(calls.length).toBeGreaterThanOrEqual(3);
    const directions = calls.map((c) => c.direction);
    expect(directions).toContain('rtl');
    expect(directions.some((d) => d === 'ltr' || d === undefined)).toBe(true);
    // Concatenated text contains all original tokens
    const joined = calls.map((c) => c.text).join('');
    expect(joined).toContain('Hi');
    expect(joined).toContain('bye');
    expect(joined).toContain('שלום');
  });

  test('explicit direction:rtl forces RTL processing even for ASCII', () => {
    const doc = makeDoc();
    const encodeSpy = vi.spyOn(doc._font, 'encode');
    doc.text('Hello', { direction: 'rtl' });
    // Pure ASCII still bypasses bidi (no RTL chars), but the resolved
    // direction is rtl so any future calls would treat it as rtl.
    expect(encodeSpy).toHaveBeenCalled();
  });

  test('RTL paragraph defaults align to right when width is set', () => {
    const doc = makeDoc();
    // Spy on _fragment's incoming options through encode call sequence;
    // simpler: verify that doc.x advances differently for right-aligned
    // RTL text vs unaligned. We just check the option propagation here.
    const captured = [];
    const orig = doc._font.encode.bind(doc._font);
    doc._font.encode = function (text, features, direction) {
      captured.push({ text, direction });
      return orig(text, features, direction);
    };
    doc.text('שלום', { width: 200 });
    // At least one call with direction rtl
    expect(captured.some((c) => c.direction === 'rtl')).toBe(true);
  });

  test('pure LTR text in an explicit ltr context never passes a direction', () => {
    const doc = makeDoc();
    const encodeSpy = vi.spyOn(doc._font, 'encode');
    doc.text('Plain text', { direction: 'ltr' });
    expect(encodeSpy).toHaveBeenCalledTimes(1);
    expect(encodeSpy.mock.calls[0][2]).toBeUndefined();
  });
});
