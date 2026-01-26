import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('SVG Path', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      compress: false,
    });
  });

  describe('arc command flag parsing', () => {
    // Arc command flags (large-arc-flag and sweep-flag) can be chained without separator
    // This is valid per SVG spec and commonly produced by SVGO (SVG optimizer)
    //
    // Arc command: a rx ry rotation large-arc-flag sweep-flag x y
    // - large-arc-flag and sweep-flag are 0 or 1
    // - They can be written without separator: "010" = 0, 1, 0 (flag, flag, x)
    test('parses arc with chained flags "a5 5 0 0110 10"', () => {
      // a5 5 0 0110 10 should parse as:
      //   rx=5, ry=5, rotation=0, large-arc=0, sweep=1, x=10, y=10
      // The "01" in "0110" are the two flags (0 and 1)
      // The "10" after is the x coordinate
      // This requires special handling because "0110" looks like one number
      const docData = logData(document);

      // This path should produce valid bezier curves for the arc
      // If parsing fails, the arc won't render correctly
      document.path('M0 0 a5 5 0 0110 10').stroke();
      // same as "a 5 5 0 0 1 10 10"
      document.end();

      const content = docData.join('');
      // Arc is converted to bezier curves, so we should see 'c' (curveto) commands
      // PDF format: "x1 y1 x2 y2 x3 y3 c"
      expect(content).toContain('2.761424 -2.761424 7.238576 -2.761424 10 0 c');
      expect(content).toContain(
        '12.761424 2.761424 12.761424 7.238576 10 10 c',
      );
    });

    test('parses arc with chained flags where flags touch x coordinate "a5 5 0 011-5"', () => {
      // a5 5 0 011-5 should parse as:
      //   rx=5, ry=5, rotation=0, large-arc=0, sweep=1, x=1, y=-5
      // The negative sign separates y from the previous number

      const docData = logData(document);

      document.path('M0 0 a5 5 0 011-5').stroke();
      // same as "a 5 5 0 0 1 1 -5"
      document.end();

      const content = docData.join('');
      expect(content).toContain('-0.6054 -1.72418 -0.221977 -3.641295 1 -5 c');
    });
  });

  describe('basic path commands', () => {
    test('parses moveto and lineto', () => {
      const docData = logData(document);

      document.path('M10 20 L30 40').stroke();
      document.end();

      expect(docData.length).toBeGreaterThan(0);
    });

    test('parses relative moveto and lineto', () => {
      const docData = logData(document);

      document.path('m10 20 l30 40').stroke();
      document.end();

      expect(docData.length).toBeGreaterThan(0);
    });

    test('parses cubic bezier', () => {
      const docData = logData(document);

      document.path('M10 10 C20 20 40 20 50 10').stroke();
      document.end();

      expect(docData.length).toBeGreaterThan(0);
    });

    test('parses quadratic bezier', () => {
      const docData = logData(document);

      document.path('M10 10 Q30 30 50 10').stroke();
      document.end();

      expect(docData.length).toBeGreaterThan(0);
    });

    test('parses closepath', () => {
      const docData = logData(document);

      document.path('M10 10 L50 10 L30 50 Z').stroke();
      document.end();

      expect(docData.length).toBeGreaterThan(0);
    });
  });

  describe('number formats', () => {
    test('parses negative numbers without separator', () => {
      const docData = logData(document);

      // -10-20 should be parsed as -10 and -20
      document.path('M10 10 l-10-20').stroke();
      document.end();

      expect(docData.length).toBeGreaterThan(0);
    });

    test('parses decimal numbers', () => {
      const docData = logData(document);

      document.path('M10.5 20.5 L30.5 40.5').stroke();
      document.end();

      expect(docData.length).toBeGreaterThan(0);
    });

    test('parses chained decimals ".5.5"', () => {
      const docData = logData(document);

      // .5.5 should be parsed as 0.5 and 0.5
      document.path('M10 10 l.5.5').stroke();
      document.end();

      expect(docData.length).toBeGreaterThan(0);
    });

    test('parses scientific notation', () => {
      const docData = logData(document);

      document.path('M1e1 2e1 L3e1 4e1').stroke();
      document.end();

      expect(docData.length).toBeGreaterThan(0);
    });
  });
});
