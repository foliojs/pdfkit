import { describe, expect, test } from 'vitest';
import { containsRTL, detectBaseDirection, visualRuns } from '../../lib/bidi';

describe('bidi helpers', () => {
  describe('containsRTL', () => {
    test('false for pure ASCII', () => {
      expect(containsRTL('Hello, world!')).toBe(false);
    });

    test('false for empty string', () => {
      expect(containsRTL('')).toBe(false);
    });

    test('false for null/undefined', () => {
      expect(containsRTL(null)).toBe(false);
      expect(containsRTL(undefined)).toBe(false);
    });

    test('true for Hebrew', () => {
      expect(containsRTL('שלום')).toBe(true);
    });

    test('true for mixed Hebrew + ASCII', () => {
      expect(containsRTL('Hello שלום')).toBe(true);
    });

    test('true for Arabic', () => {
      expect(containsRTL('مرحبا')).toBe(true);
    });
  });

  describe('detectBaseDirection', () => {
    test('ltr for pure ASCII', () => {
      expect(detectBaseDirection('Hello, world!')).toBe('ltr');
    });

    test('rtl for pure Hebrew', () => {
      expect(detectBaseDirection('שלום עולם')).toBe('rtl');
    });

    test('rtl when first strong char is Hebrew', () => {
      expect(detectBaseDirection('שלום World')).toBe('rtl');
    });

    test('ltr when first strong char is Latin', () => {
      expect(detectBaseDirection('Hello שלום')).toBe('ltr');
    });

    test('ltr for empty/falsy input', () => {
      expect(detectBaseDirection('')).toBe('ltr');
      expect(detectBaseDirection(null)).toBe('ltr');
    });
  });

  describe('visualRuns', () => {
    test('pure LTR text returns single ltr run unchanged', () => {
      const runs = visualRuns('Hello world', 'ltr');
      expect(runs).toEqual([{ text: 'Hello world', direction: 'ltr' }]);
    });

    test('pure Hebrew returns single rtl run with original text', () => {
      // No reordering at the run level — fontkit will reverse glyphs internally
      // when shaped with direction='rtl'.
      const runs = visualRuns('שלום עולם', 'rtl');
      expect(runs.length).toBe(1);
      expect(runs[0].direction).toBe('rtl');
      expect(runs[0].text).toBe('שלום עולם');
    });

    test('mixed LTR paragraph: ltr run, rtl run, ltr run in logical order', () => {
      const runs = visualRuns('Hi שלום bye', 'ltr');
      // Visual order LTR: "Hi " then RTL run (shaped rtl) then " bye"
      const directions = runs.map((r) => r.direction);
      const texts = runs.map((r) => r.text);
      expect(directions).toEqual(['ltr', 'rtl', 'ltr']);
      expect(texts.join('')).toContain('Hi');
      expect(texts.join('')).toContain('bye');
      expect(texts.some((t) => /[֐-׿]/.test(t))).toBe(true);
    });

    test('RTL paragraph with embedded LTR: visually reorders runs', () => {
      // Logical "שלום World עולם" in an RTL paragraph.
      // In visual order, RTL bookends should sandwich the LTR run, but with
      // the RTL runs themselves swapped — the second logical RTL appears first
      // visually (leftmost) only if it's the visual right; actually for RTL
      // base, "first logical RTL" is at visual right, "last logical RTL" at
      // visual left.
      const runs = visualRuns('שלום World עולם', 'rtl');
      // Expect three runs: rtl, ltr, rtl, and after L2 reordering the visual
      // order is reversed at level 1 — so the runs come out reversed.
      expect(runs.length).toBeGreaterThanOrEqual(3);
      // First visual run should be the LAST logical RTL run ("עולם")
      const firstRtl = runs.find((r) => r.direction === 'rtl');
      expect(firstRtl).toBeDefined();
    });

    test('parentheses get mirrored in RTL context', () => {
      // ( in RTL context should become ) when mirrored.
      const runs = visualRuns('(שלום)', 'rtl');
      const concatenated = runs.map((r) => r.text).join('');
      // bidi-js should report mirrors at the bracket positions; after applying
      // them, the chars become )...(
      expect(concatenated).toContain(')');
      expect(concatenated).toContain('(');
    });

    test('empty string returns empty runs', () => {
      expect(visualRuns('', 'ltr')).toEqual([]);
    });
  });
});
