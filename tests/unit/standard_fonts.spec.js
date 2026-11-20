import { vi } from 'vitest';
import Helvetica from '../../lib/font/generated/Helvetica';
import TimesRoman from '../../lib/font/generated/TimesRoman';

describe('standard fonts', () => {
  let standardFonts;

  beforeEach(async () => {
    vi.resetModules();
    standardFonts = await import('../../lib/font/standard_fonts');
  });

  test('recognizes all standard PDF font names', () => {
    expect(standardFonts.STANDARD_FONT_NAMES).toHaveLength(14);
    expect(new Set(standardFonts.STANDARD_FONT_NAMES).size).toBe(14);
    expect(standardFonts.isStandardFont('Helvetica')).toBe(true);
    expect(standardFonts.isStandardFont('Roboto')).toBe(false);
  });

  test('registers one or more generated fonts', () => {
    standardFonts.registerStdFonts(Helvetica, TimesRoman);

    expect(standardFonts.getStandardFont('Helvetica')).toBe(Helvetica);
    expect(standardFonts.getStandardFont('Times-Roman')).toBe(TimesRoman);
  });

  test('replaces previously registered data', () => {
    const replacement = { ...Helvetica };

    standardFonts.registerStdFonts(Helvetica);
    standardFonts.registerStdFonts(replacement);

    expect(standardFonts.getStandardFont('Helvetica')).toBe(replacement);
  });

  test('loads and caches generated data on demand', () => {
    const loader = vi.fn(() => Helvetica);
    standardFonts.registerStdFontLoaders({ Helvetica: loader });

    expect(loader).not.toHaveBeenCalled();
    expect(standardFonts.getStandardFont('Helvetica')).toBe(Helvetica);
    expect(standardFonts.getStandardFont('Helvetica')).toBe(Helvetica);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  test('explicit registration replaces a lazy loader', () => {
    const loader = vi.fn(() => Helvetica);
    standardFonts.registerStdFontLoaders({ Helvetica: loader });

    standardFonts.registerStdFonts(Helvetica);

    expect(standardFonts.getStandardFont('Helvetica')).toBe(Helvetica);
    expect(loader).not.toHaveBeenCalled();
  });

  test('reports unregistered standard fonts', () => {
    expect(() => standardFonts.getStandardFont('Helvetica')).toThrow(
      'Standard font "Helvetica" is not registered. ' +
        'Call registerStdFonts() before using it.',
    );
  });

  test('returns null for non-standard font names', () => {
    expect(standardFonts.getStandardFont('Roboto')).toBeNull();
  });

  test.each([
    null,
    {},
    { name: 'Roboto' },
    { ...Helvetica, name: 'Times-Roman' },
  ])('rejects invalid generated data %#', (data) => {
    if (data?.name === 'Times-Roman') {
      standardFonts.registerStdFontLoaders({ Helvetica: () => data });
      expect(() => standardFonts.getStandardFont('Helvetica')).toThrow(
        'Invalid standard font data.',
      );
    } else {
      expect(() => standardFonts.registerStdFonts(data)).toThrow(
        'Invalid standard font data.',
      );
    }
  });

  test('rejects invalid loaders', () => {
    expect(() =>
      standardFonts.registerStdFontLoaders({ Roboto: () => null }),
    ).toThrow('Invalid standard font loader.');
    expect(() =>
      standardFonts.registerStdFontLoaders({ Helvetica: Helvetica }),
    ).toThrow('Invalid standard font loader.');
  });
});
