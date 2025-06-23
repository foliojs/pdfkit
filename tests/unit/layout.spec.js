import PDFDocument from '../../lib/document';
import LayoutEngine from '../../lib/text/layout';
import { logData } from './helpers';
import { test as baseTest } from 'vitest';

describe('LayoutEngine', () => {
  const test = baseTest.extend({
    doc: ({}, use) => use(new PDFDocument({ size: 'A4', margin: 72 })),
    layout: ({ doc }, use) => use(new LayoutEngine(doc)),
    docData: async ({ doc }, use) => use(logData(doc)),
  });

  describe('boundsOfString', () => {
    afterEach(({ doc }) => {
      doc.end();
    });
    test.concurrent.for([
      ['', undefined, { x: 72, y: 72, width: 0, height: 0 }],
      ['', {}, { x: 72, y: 72, width: 0, height: 0 }],
      [
        'Hello world!',
        {},
        { x: 72, y: 72, width: 62.736000000000004, height: 11.100000000000001 },
      ],
    ])(`'%s', %j -> %j`, ([text, options, expected], { layout, expect }) => {
      expect(layout.boundsOfString(text, options)).toEqual(expected);
    });
  });
});
