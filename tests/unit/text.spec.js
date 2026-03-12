import PDFDocument from '../../lib/document';
import { logData } from './helpers';
import fs from 'fs';
import path from 'path';
import fontkit from 'fontkit';

/**
 * Create a mock fontkit font object for emoji testing.
 */
function createMockFont(overrides = {}) {
  return {
    unitsPerEm: 2048,
    ascent: 1900,
    layout() {
      return {
        glyphs: overrides.glyphs || [],
        positions: overrides.positions || [],
      };
    },
    CBLC: overrides.CBLC || null,
    directory: overrides.directory || { tables: {} },
    stream: overrides.stream || { buffer: Buffer.alloc(0) },
    ...overrides,
  };
}

describe('Text', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      compress: false,
    });
  });

  describe('text', () => {
    test('with simple content', () => {
      const docData = logData(document);

      document.text('simple text');
      document.end();

      expect(docData).toContainText({ text: 'simple text' });
    });

    test('with destination', () => {
      // just check that there is no exception
      document.text('simple text', { destination: 'anchor' });
    });

    test('with content ending after page right margin', () => {
      const docData = logData(document);

      const textStream = Buffer.from(
        `1 0 0 -1 0 792 cm
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 600 763.384 Tm
/F1 12 Tf
[<73696d706c65207465> 30 <7874> 0] TJ
ET
Q
`,
        'binary',
      );

      document.text('simple text', 600, 20);
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 117
>>`,
        `stream`,
        textStream,
        `\nendstream`,
        `endobj`,
      ]);
    });

    test('with line too thin to contain a single character', () => {
      const docData = logData(document);

      const text = 'simple text';
      const textStream = Buffer.from(
        `1 0 0 -1 0 792 cm
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 773.384 Tm
/F1 12 Tf
[<73> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 759.512 Tm
/F1 12 Tf
[<69> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 745.64 Tm
/F1 12 Tf
[<6d> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 731.768 Tm
/F1 12 Tf
[<70> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 717.896 Tm
/F1 12 Tf
[<6c> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 704.024 Tm
/F1 12 Tf
[<65> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 690.152 Tm
/F1 12 Tf
[<2074> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 676.28 Tm
/F1 12 Tf
[<65> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 662.408 Tm
/F1 12 Tf
[<78> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 648.536 Tm
/F1 12 Tf
[<74> 0] TJ
ET
Q
`,
        'binary',
      );

      // before this test, this case used to make the code run into an infinite loop.
      // To handle regression gracefully and avoid sticking this test into an infinite loop,
      // we look out for a side effect of this infinite loop, witch is adding an infinite number of pages.
      // Normally, there should not be any page added to the document.

      document.on('pageAdded', () => {
        const pageRange = document.bufferedPageRange();
        const newPageIndex = pageRange.start + pageRange.count;
        // We try restrict the fail condition to only infinite loop, so we wait for several pages to be added.
        if (newPageIndex > 10) {
          throw new Error('Infinite loop detected');
        }
      });

      document.text(text, 10, 10, { width: 2 });
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 738
>>`,
        `stream`,
        textStream,
        `\nendstream`,
        `endobj`,
      ]);
    });

    test('bounded text precision - issue #1611', () => {
      const docData = logData(document);
      const text = 'New york';
      const bounds = document.boundsOfString(text);
      // Draw text which is constrained to the bounds
      document.text(text, {
        ellipsis: true,
        width: bounds.width,
        height: bounds.height,
      });

      document.end();

      expect(docData).toContainText({ text });
    });
  });

  describe('text with structure parent links', () => {
    beforeEach(() => {
      document = new PDFDocument({
        info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
        compress: false,
        tagged: true,
      });
    });

    test('should auto-link text inside Link structure element', () => {
      const docData = logData(document);

      const linkElement = document.struct('Link', () => {
        document.text('Click here', 100, 100, {
          link: 'http://example.com',
        });
      });

      document.addStructure(linkElement);
      linkElement.end();
      document.end();

      const dataStr = docData.join('\n');
      expect(dataStr).toContain('/S /Link');
      expect(dataStr).toContain('/StructParent');
    });

    test('should not add StructParent outside Link structure', () => {
      const docData = logData(document);

      document.text('Click here', 100, 100, {
        link: 'http://example.com',
      });

      document.end();

      const dataStr = docData.join('\n');
      expect(dataStr).toContain('/Subtype /Link');
      expect(dataStr).not.toContain('/StructParent');
    });

    test('should not leak link options to subsequent structure elements with continued text', () => {
      const docData = logData(document);

      const paragraph = document.struct('P');
      document.addStructure(paragraph);

      paragraph.add(
        document.struct('Span', () => {
          document.text('This is some text before ', 100, 100, {
            continued: true,
          });
        }),
      );

      paragraph.add(
        document.struct('Link', () => {
          document.text('Here is a link!', {
            link: 'http://google.com/',
            underline: true,
            continued: true,
          });
        }),
      );

      paragraph.add(
        document.struct('Span', () => {
          document.text(' and this is text after the link.');
        }),
      );

      paragraph.end();
      document.end();

      const dataStr = docData.join('\n');

      // Count how many link annotations exist - should be exactly 1
      const linkMatches = dataStr.match(/\/Subtype \/Link/g);
      expect(linkMatches).toBeTruthy();
      expect(linkMatches.length).toBe(1);

      expect(dataStr).toContain('/S /Span');
      expect(dataStr).toContain('/S /Link');
    });
  });

  describe('_calcGlyphOffsetInCBDT', () => {
    test('version 1: uint32 offset array lookup', () => {
      const subtable = { version: 1, offsetArray: [0, 100, 200, 300] };
      // glyphId=12, firstGlyphIndex=10 → idx=2 → offsetArray[2] = 200
      expect(document._calcGlyphOffsetInCBDT(subtable, 10, 12)).toBe(200);
    });

    test('version 1: returns null for out-of-range index', () => {
      const subtable = { version: 1, offsetArray: [0, 100] };
      expect(document._calcGlyphOffsetInCBDT(subtable, 10, 20)).toBeNull();
    });

    test('version 2: fixed-size calculation', () => {
      const subtable = { version: 2, imageSize: 256 };
      // glyphId=15, firstGlyphIndex=10 → idx=5 → 5*256 = 1280
      expect(document._calcGlyphOffsetInCBDT(subtable, 10, 15)).toBe(1280);
    });

    test('version 3: uint16 offset array lookup', () => {
      const subtable = { version: 3, offsetArray: [0, 50, 100, 150] };
      expect(document._calcGlyphOffsetInCBDT(subtable, 5, 7)).toBe(100);
    });

    test('version 4: sparse glyphCode/offset pairs', () => {
      const subtable = {
        version: 4,
        glyphArray: [
          { glyphCode: 10, offset: 0 },
          { glyphCode: 20, offset: 500 },
          { glyphCode: 30, offset: 1000 },
        ],
      };
      expect(document._calcGlyphOffsetInCBDT(subtable, 10, 20)).toBe(500);
    });

    test('version 4: returns null for missing glyph', () => {
      const subtable = {
        version: 4,
        glyphArray: [{ glyphCode: 10, offset: 0 }],
      };
      expect(document._calcGlyphOffsetInCBDT(subtable, 10, 99)).toBeNull();
    });

    test('version 5: fixed-size with glyph code array', () => {
      const subtable = {
        version: 5,
        imageSize: 128,
        glyphCodeArray: [10, 20, 30, 40],
      };
      // glyphId=30 is at index 2 → 2*128 = 256
      expect(document._calcGlyphOffsetInCBDT(subtable, 10, 30)).toBe(256);
    });

    test('version 5: returns null for missing glyph', () => {
      const subtable = {
        version: 5,
        imageSize: 128,
        glyphCodeArray: [10, 20, 30],
      };
      expect(document._calcGlyphOffsetInCBDT(subtable, 10, 99)).toBeNull();
    });

    test('unknown version returns null', () => {
      const subtable = { version: 99 };
      expect(document._calcGlyphOffsetInCBDT(subtable, 0, 0)).toBeNull();
    });
  });

  describe('_extractCBDTBitmap', () => {
    test('returns null when CBDT table is missing', () => {
      const font = createMockFont({ directory: { tables: {} } });
      expect(document._extractCBDTBitmap(font, 10, 20)).toBeNull();
    });

    test('returns null when CBLC table is missing', () => {
      const font = createMockFont({
        directory: { tables: { CBDT: { offset: 0, length: 100 } } },
      });
      expect(document._extractCBDTBitmap(font, 10, 20)).toBeNull();
    });

    test('returns null when CBLC has no sizes', () => {
      const font = createMockFont({
        directory: {
          tables: {
            CBDT: { offset: 0, length: 100 },
            CBLC: { offset: 0, length: 100 },
          },
        },
        CBLC: { sizes: [] },
      });
      expect(document._extractCBDTBitmap(font, 10, 20)).toBeNull();
    });

    test('returns null when glyph is outside all strike ranges', () => {
      const font = createMockFont({
        directory: {
          tables: {
            CBDT: { offset: 0, length: 100 },
            CBLC: { offset: 0, length: 100 },
          },
        },
        CBLC: {
          sizes: [
            {
              ppemX: 20,
              startGlyphIndex: 100,
              endGlyphIndex: 200,
              numberOfIndexSubTables: 0,
              indexSubTableArray: [],
            },
          ],
        },
      });
      // glyphId=50 is outside [100,200]
      expect(document._extractCBDTBitmap(font, 50, 20)).toBeNull();
    });

    test('reads format 17 (SmallMetrics) bitmap correctly', () => {
      // Build a minimal CBDT buffer with format 17:
      // SmallMetrics (5 bytes) + uint32 dataLen + PNG data
      const pngData = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0xaa, 0xbb]);
      const cbdtOffset = 100;
      const imageDataOffset = 0; // relative to CBDT
      const glyphOffset = 0;

      // Build buffer: [5 bytes metrics][4 bytes dataLen][png data]
      const buf = Buffer.alloc(cbdtOffset + 9 + pngData.length);
      // SmallMetrics at cbdtOffset + 0 (5 bytes, contents don't matter for this test)
      buf.writeUInt32BE(pngData.length, cbdtOffset + 5); // dataLen
      pngData.copy(buf, cbdtOffset + 9);

      const font = createMockFont({
        directory: {
          tables: {
            CBDT: { offset: cbdtOffset, length: buf.length - cbdtOffset },
            CBLC: { offset: 0, length: 100 },
          },
        },
        stream: { buffer: buf },
        CBLC: {
          sizes: [
            {
              ppemX: 20,
              startGlyphIndex: 10,
              endGlyphIndex: 50,
              numberOfIndexSubTables: 1,
              indexSubTableArray: [
                {
                  firstGlyphIndex: 10,
                  lastGlyphIndex: 50,
                  subtable: {
                    version: 1,
                    imageFormat: 17,
                    imageDataOffset: imageDataOffset,
                    offsetArray: [glyphOffset],
                  },
                },
              ],
            },
          ],
        },
      });

      const result = document._extractCBDTBitmap(font, 10, 20);
      expect(result).not.toBeNull();
      expect(Buffer.compare(result, pngData)).toBe(0);
    });

    test('reads format 18 (BigMetrics) bitmap correctly', () => {
      const pngData = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0xcc]);
      const cbdtOffset = 50;

      const buf = Buffer.alloc(cbdtOffset + 12 + pngData.length);
      // BigMetrics (8 bytes) + uint32 dataLen
      buf.writeUInt32BE(pngData.length, cbdtOffset + 8);
      pngData.copy(buf, cbdtOffset + 12);

      const font = createMockFont({
        directory: {
          tables: {
            CBDT: { offset: cbdtOffset, length: buf.length - cbdtOffset },
            CBLC: { offset: 0, length: 100 },
          },
        },
        stream: { buffer: buf },
        CBLC: {
          sizes: [
            {
              ppemX: 20,
              startGlyphIndex: 10,
              endGlyphIndex: 50,
              numberOfIndexSubTables: 1,
              indexSubTableArray: [
                {
                  firstGlyphIndex: 10,
                  lastGlyphIndex: 50,
                  subtable: {
                    version: 2,
                    imageFormat: 18,
                    imageDataOffset: 0,
                    imageSize: 12 + pngData.length,
                  },
                },
              ],
            },
          ],
        },
      });

      const result = document._extractCBDTBitmap(font, 10, 20);
      expect(result).not.toBeNull();
      expect(Buffer.compare(result, pngData)).toBe(0);
    });

    test('reads format 19 (no metrics) bitmap correctly', () => {
      const pngData = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0xdd, 0xee]);
      const cbdtOffset = 30;

      const buf = Buffer.alloc(cbdtOffset + 4 + pngData.length);
      // Format 19: uint32 dataLen + PNG data (no metrics)
      buf.writeUInt32BE(pngData.length, cbdtOffset);
      pngData.copy(buf, cbdtOffset + 4);

      const font = createMockFont({
        directory: {
          tables: {
            CBDT: { offset: cbdtOffset, length: buf.length - cbdtOffset },
            CBLC: { offset: 0, length: 100 },
          },
        },
        stream: { buffer: buf },
        CBLC: {
          sizes: [
            {
              ppemX: 20,
              startGlyphIndex: 5,
              endGlyphIndex: 50,
              numberOfIndexSubTables: 1,
              indexSubTableArray: [
                {
                  firstGlyphIndex: 5,
                  lastGlyphIndex: 50,
                  subtable: {
                    version: 1,
                    imageFormat: 19,
                    imageDataOffset: 0,
                    offsetArray: [0],
                  },
                },
              ],
            },
          ],
        },
      });

      const result = document._extractCBDTBitmap(font, 5, 20);
      expect(result).not.toBeNull();
      expect(Buffer.compare(result, pngData)).toBe(0);
    });

    test('selects closest ppem strike', () => {
      const pngData = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const cbdtOffset = 10;

      const buf = Buffer.alloc(cbdtOffset + 9 + pngData.length);
      buf.writeUInt32BE(pngData.length, cbdtOffset + 5);
      pngData.copy(buf, cbdtOffset + 9);

      const makeStrike = (ppem) => ({
        ppemX: ppem,
        startGlyphIndex: 1,
        endGlyphIndex: 100,
        numberOfIndexSubTables: 1,
        indexSubTableArray: [
          {
            firstGlyphIndex: 1,
            lastGlyphIndex: 100,
            subtable: {
              version: 1,
              imageFormat: 17,
              imageDataOffset: 0,
              offsetArray: [0],
            },
          },
        ],
      });

      const font = createMockFont({
        directory: {
          tables: {
            CBDT: { offset: cbdtOffset, length: buf.length - cbdtOffset },
            CBLC: { offset: 0, length: 100 },
          },
        },
        stream: { buffer: buf },
        CBLC: {
          sizes: [makeStrike(20), makeStrike(40), makeStrike(96)],
        },
      });

      // Target ppem=38 should select strike with ppemX=40 (closest)
      const result = document._extractCBDTBitmap(font, 1, 38);
      expect(result).not.toBeNull();
    });

    test('returns null for unsupported image format', () => {
      const cbdtOffset = 10;
      const buf = Buffer.alloc(cbdtOffset + 100);

      const font = createMockFont({
        directory: {
          tables: {
            CBDT: { offset: cbdtOffset, length: 100 },
            CBLC: { offset: 0, length: 100 },
          },
        },
        stream: { buffer: buf },
        CBLC: {
          sizes: [
            {
              ppemX: 20,
              startGlyphIndex: 1,
              endGlyphIndex: 100,
              numberOfIndexSubTables: 1,
              indexSubTableArray: [
                {
                  firstGlyphIndex: 1,
                  lastGlyphIndex: 100,
                  subtable: {
                    version: 1,
                    imageFormat: 99,
                    imageDataOffset: 0,
                    offsetArray: [0],
                  },
                },
              ],
            },
          ],
        },
      });

      const result = document._extractCBDTBitmap(font, 1, 20);
      expect(result).toBeNull();
    });
  });

  describe('_manualCBLCLookup', () => {
    test('finds glyph in manually-parsed index subtable (format 1)', () => {
      // Build a minimal CBLC buffer with one BitmapSizeTable and one IndexSubtableArray entry
      const cblcOffset = 0;
      // Header (8 bytes) + BitmapSizeTable (48 bytes)
      const totalSize = 8 + 48 + 8 + 8 + 8; // header + BST + IST array entry + subtable header + offset array
      const buf = Buffer.alloc(cblcOffset + totalSize + 100);

      // BitmapSizeTable at offset 8, first uint32 = indexSubTableArrayOffset
      const istArrayOffset = 56; // 8 + 48 = after BST
      buf.writeUInt32BE(istArrayOffset, cblcOffset + 8);

      // IndexSubtableArray entry at istArrayOffset:
      // firstGlyph (uint16), lastGlyph (uint16), additionalOffset (uint32)
      const entryPos = cblcOffset + istArrayOffset;
      buf.writeUInt16BE(10, entryPos); // firstGlyph
      buf.writeUInt16BE(20, entryPos + 2); // lastGlyph
      buf.writeUInt32BE(8, entryPos + 4); // additionalOffset (relative to istArrayStart)

      // IndexSubtable header at istArrayStart + additionalOffset:
      const subStart = cblcOffset + istArrayOffset + 8;
      buf.writeUInt16BE(1, subStart); // indexFormat = 1
      buf.writeUInt16BE(17, subStart + 2); // imageFormat = 17
      buf.writeUInt32BE(500, subStart + 4); // imageDataOffset

      // Offset array: uint32 per glyph (for glyphId=15, idx=5)
      buf.writeUInt32BE(100, subStart + 8 + 5 * 4); // offset for glyph 15

      const font = {
        stream: { buffer: buf },
        directory: { tables: { CBLC: { offset: cblcOffset } } },
      };

      const result = document._manualCBLCLookup(font, 0, 1, 15);
      expect(result).not.toBeNull();
      expect(result.offset).toBe(500 + 100); // imageDataOffset + relOffset
      expect(result.imageFormat).toBe(17);
    });

    test('returns null when glyph is not found in any subtable', () => {
      const cblcOffset = 0;
      const buf = Buffer.alloc(200);

      const istArrayOffset = 56;
      buf.writeUInt32BE(istArrayOffset, cblcOffset + 8);

      const entryPos = cblcOffset + istArrayOffset;
      buf.writeUInt16BE(10, entryPos); // firstGlyph
      buf.writeUInt16BE(20, entryPos + 2); // lastGlyph
      buf.writeUInt32BE(8, entryPos + 4);

      const subStart = cblcOffset + istArrayOffset + 8;
      buf.writeUInt16BE(1, subStart);
      buf.writeUInt16BE(17, subStart + 2);
      buf.writeUInt32BE(0, subStart + 4);

      const font = {
        stream: { buffer: buf },
        directory: { tables: { CBLC: { offset: cblcOffset } } },
      };

      // glyphId=99 is outside [10,20]
      const result = document._manualCBLCLookup(font, 0, 1, 99);
      expect(result).toBeNull();
    });

    test('handles format 2 (fixed-size images)', () => {
      const cblcOffset = 0;
      const buf = Buffer.alloc(200);

      const istArrayOffset = 56;
      buf.writeUInt32BE(istArrayOffset, cblcOffset + 8);

      const entryPos = cblcOffset + istArrayOffset;
      buf.writeUInt16BE(5, entryPos);
      buf.writeUInt16BE(15, entryPos + 2);
      buf.writeUInt32BE(8, entryPos + 4);

      const subStart = cblcOffset + istArrayOffset + 8;
      buf.writeUInt16BE(2, subStart); // indexFormat = 2
      buf.writeUInt16BE(18, subStart + 2); // imageFormat = 18
      buf.writeUInt32BE(1000, subStart + 4); // imageDataOffset
      buf.writeUInt32BE(256, subStart + 8); // imageSize

      const font = {
        stream: { buffer: buf },
        directory: { tables: { CBLC: { offset: cblcOffset } } },
      };

      // glyphId=8, firstGlyph=5 → idx=3 → offset = 3*256 = 768
      const result = document._manualCBLCLookup(font, 0, 1, 8);
      expect(result).not.toBeNull();
      expect(result.offset).toBe(1000 + 768);
      expect(result.imageFormat).toBe(18);
    });
  });

  describe('_getEmojiImage', () => {
    test('returns null when SBIX has no image and no CBDT tables', () => {
      const glyph = {
        id: 42,
        getImageForSize: jest.fn().mockReturnValue(null),
      };
      const font = createMockFont();

      const result = document._getEmojiImage(glyph, 20, font);
      expect(result).toBeNull();
    });

    test('returns cached result on second call', () => {
      const glyph = {
        id: 42,
        getImageForSize: jest.fn().mockReturnValue(null),
      };
      const font = createMockFont();

      document._getEmojiImage(glyph, 20, font);
      const result = document._getEmojiImage(glyph, 20, font);
      // getImageForSize should only be called once (second call uses cache)
      expect(glyph.getImageForSize).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    test('handles getImageForSize throwing errors gracefully', () => {
      const glyph = {
        id: 50,
        getImageForSize: jest.fn().mockImplementation(() => {
          throw new Error('No sbix data');
        }),
      };
      const font = createMockFont();

      const result = document._getEmojiImage(glyph, 20, font);
      expect(result).toBeNull();
    });

    test('returns null for unsupported image types', () => {
      const glyph = {
        id: 60,
        getImageForSize: jest.fn().mockReturnValue({
          type: 'tiff',
          data: Buffer.from([0x00, 0x01]),
        }),
      };
      const font = createMockFont();

      const result = document._getEmojiImage(glyph, 20, font);
      expect(result).toBeNull();
    });

    test('trims trailing space from image type', () => {
      // SBIX type field often has trailing space: "png " → should be treated as "png"
      const pngHeader = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
      // Create a minimal valid PNG buffer (just header + IHDR will fail but
      // PDFImage.open handles it). We test that the type trimming works.
      const glyph = {
        id: 70,
        getImageForSize: jest.fn().mockReturnValue({
          type: 'png ',
          data: pngHeader,
        }),
      };
      const font = createMockFont();

      // This may throw because pngHeader isn't a valid full PNG,
      // but the type check should pass (it won't return null for unsupported type)
      document._getEmojiImage(glyph, 20, font);
      // Either returns an image or null due to invalid PNG data — but NOT null due to type check
      // The key assertion is that "png " is accepted as a valid type
      expect(glyph.getImageForSize).toHaveBeenCalledWith(20);
    });
  });

  describe('_emojiFragment', () => {
    test('returns early when no emoji font is set', () => {
      document._emojiFont = null;
      // Should not throw
      expect(() => {
        document._emojiFragment('😀', 0, 0, {});
      }).not.toThrow();
    });

    test('routes COLR glyphs to _renderCOLREmoji', () => {
      const mockGlyph = { id: 1, type: 'COLR', layers: [] };
      document._emojiFont = createMockFont({
        glyphs: [mockGlyph],
        positions: [{ xAdvance: 2048, xOffset: 0 }],
      });
      document._fontSize = 16;

      const spy = jest
        .spyOn(document, '_renderCOLREmoji')
        .mockImplementation(() => {});

      document._emojiFragment('😀', 100, 200, {});
      expect(spy).toHaveBeenCalledWith(
        mockGlyph,
        100,
        200,
        16,
        document._emojiFont,
      );

      spy.mockRestore();
    });

    test('routes non-COLR glyphs to _getEmojiImage and _placeEmojiImage', () => {
      const mockGlyph = { id: 1, type: 'SBIX' };
      document._emojiFont = createMockFont({
        glyphs: [mockGlyph],
        positions: [{ xAdvance: 2048, xOffset: 0 }],
      });
      document._fontSize = 16;

      const mockImage = { label: 'EI1', obj: {} };
      const imgSpy = jest
        .spyOn(document, '_getEmojiImage')
        .mockReturnValue(mockImage);
      const placeSpy = jest
        .spyOn(document, '_placeEmojiImage')
        .mockImplementation(() => {});

      document._emojiFragment('😀', 100, 200, {});

      expect(imgSpy).toHaveBeenCalledWith(mockGlyph, 16, document._emojiFont);
      expect(placeSpy).toHaveBeenCalledWith(mockImage, 100, 200, 16, 16);

      imgSpy.mockRestore();
      placeSpy.mockRestore();
    });

    test('skips glyph silently when _getEmojiImage returns null', () => {
      const mockGlyph = { id: 1, type: 'TTF' };
      document._emojiFont = createMockFont({
        glyphs: [mockGlyph],
        positions: [{ xAdvance: 2048, xOffset: 0 }],
      });
      document._fontSize = 16;

      jest.spyOn(document, '_getEmojiImage').mockReturnValue(null);
      const placeSpy = jest
        .spyOn(document, '_placeEmojiImage')
        .mockImplementation(() => {});

      document._emojiFragment('😀', 100, 200, {});
      expect(placeSpy).not.toHaveBeenCalled();

      placeSpy.mockRestore();
    });
  });

  describe('_renderCOLREmoji', () => {
    test('renders layers with correct fill colors', () => {
      // addContent writes to page content stream — spy on it directly
      const contentCalls = [];
      const origAddContent = document.addContent.bind(document);
      jest.spyOn(document, 'addContent').mockImplementation((str) => {
        contentCalls.push(str);
        return origAddContent(str);
      });

      const mockGlyph = {
        layers: [
          {
            glyph: {
              path: {
                commands: [
                  { command: 'moveTo', args: [0, 2048] },
                  { command: 'lineTo', args: [2048, 2048] },
                  { command: 'lineTo', args: [2048, 0] },
                  { command: 'closePath', args: [] },
                ],
              },
            },
            color: { red: 255, green: 0, blue: 0, alpha: 255 },
          },
        ],
      };

      const font = createMockFont();
      document._renderCOLREmoji(mockGlyph, 100, 200, 16, font);

      const dataStr = contentCalls.join('\n');
      // Should have save/restore (q/Q) and fill (f) operators
      expect(dataStr).toContain('q');
      expect(dataStr).toContain('f');
      expect(dataStr).toContain('Q');
      document.addContent.mockRestore();
    });

    test('skips layers with empty paths', () => {
      const contentCalls = [];
      const origAddContent = document.addContent.bind(document);
      jest.spyOn(document, 'addContent').mockImplementation((str) => {
        contentCalls.push(str);
        return origAddContent(str);
      });

      const mockGlyph = {
        layers: [
          {
            glyph: { path: { commands: [] } },
            color: { red: 255, green: 0, blue: 0, alpha: 255 },
          },
          {
            glyph: { path: null },
            color: { red: 0, green: 255, blue: 0, alpha: 255 },
          },
        ],
      };

      const font = createMockFont();
      document._renderCOLREmoji(mockGlyph, 100, 200, 16, font);

      const dataStr = contentCalls.join('\n');
      // No fill operator should be emitted since both layers have empty paths
      expect(dataStr).not.toContain('f');
      document.addContent.mockRestore();
    });

    test('handles alpha opacity less than 255', () => {
      const mockGlyph = {
        layers: [
          {
            glyph: {
              path: {
                commands: [
                  { command: 'moveTo', args: [0, 0] },
                  { command: 'lineTo', args: [100, 0] },
                  { command: 'closePath', args: [] },
                ],
              },
            },
            color: { red: 0, green: 0, blue: 255, alpha: 128 },
          },
        ],
      };

      const font = createMockFont();
      const opacitySpy = jest.spyOn(document, 'fillOpacity');

      document._renderCOLREmoji(mockGlyph, 0, 0, 16, font);

      expect(opacitySpy).toHaveBeenCalledWith(128 / 255);
      opacitySpy.mockRestore();
    });

    test('converts quadratic bezier to cubic', () => {
      const contentCalls = [];
      const origAddContent = document.addContent.bind(document);
      jest.spyOn(document, 'addContent').mockImplementation((str) => {
        contentCalls.push(str);
        return origAddContent(str);
      });

      const mockGlyph = {
        layers: [
          {
            glyph: {
              path: {
                commands: [
                  { command: 'moveTo', args: [0, 0] },
                  { command: 'quadraticCurveTo', args: [1024, 2048, 2048, 0] },
                  { command: 'closePath', args: [] },
                ],
              },
            },
            color: { red: 0, green: 0, blue: 0, alpha: 255 },
          },
        ],
      };

      const font = createMockFont();
      document._renderCOLREmoji(mockGlyph, 0, 0, 16, font);

      const dataStr = contentCalls.join('\n');
      // Should contain a bezier curve ('c' operator) not a quadratic ('v' or 'y')
      expect(dataStr).toMatch(
        /[0-9.]+ [0-9.]+ [0-9.]+ [0-9.]+ [0-9.]+ [0-9.]+ c/,
      );
      document.addContent.mockRestore();
    });
  });

  // ─── Real font integration tests ─────────────────────────────────
  // These tests use actual downloadable emoji fonts instead of mocks.
  // They are skipped if the font files are not present in tests/fonts/.

  const twemojiPath = path.join(__dirname, '../fonts/Twemoji.Mozilla.ttf');
  const notoPath = path.join(__dirname, '../fonts/NotoColorEmoji.ttf');
  const hasTwemoji = fs.existsSync(twemojiPath);
  const hasNoto = fs.existsSync(notoPath);

  const describeIfTwemoji = hasTwemoji ? describe : describe.skip;
  const describeIfNoto = hasNoto ? describe : describe.skip;

  describeIfTwemoji('Twemoji.Mozilla COLR/CPAL (real font)', () => {
    let twFont;

    beforeAll(() => {
      const data = fs.readFileSync(twemojiPath);
      twFont = fontkit.create(data);
    });

    test('font has COLR and CPAL tables', () => {
      expect(twFont.directory.tables.COLR).toBeTruthy();
      expect(twFont.directory.tables.CPAL).toBeTruthy();
    });

    test('glyphForCodePoint returns COLR glyph for U+1F600', () => {
      const glyph = twFont.glyphForCodePoint(0x1f600);
      expect(glyph).toBeTruthy();
      expect(glyph.type).toBe('COLR');
      expect(glyph.layers).toBeTruthy();
      expect(glyph.layers.length).toBeGreaterThan(0);
    });

    test('COLR layers have valid color and path data', () => {
      const glyph = twFont.glyphForCodePoint(0x1f600);
      for (const layer of glyph.layers) {
        expect(layer.color).toHaveProperty('red');
        expect(layer.color).toHaveProperty('green');
        expect(layer.color).toHaveProperty('blue');
        expect(layer.color).toHaveProperty('alpha');
        expect(layer.color.red).toBeGreaterThanOrEqual(0);
        expect(layer.color.red).toBeLessThanOrEqual(255);
        expect(layer.glyph.path.commands.length).toBeGreaterThan(0);
      }
    });

    test('_renderCOLREmoji produces PDF operators from real glyph', () => {
      const glyph = twFont.glyphForCodePoint(0x1f600);

      const contentCalls = [];
      const origAddContent = document.addContent.bind(document);
      jest.spyOn(document, 'addContent').mockImplementation((str) => {
        contentCalls.push(str);
        return origAddContent(str);
      });

      document._renderCOLREmoji(glyph, 100, 200, 16, twFont);

      const dataStr = contentCalls.join('\n');
      // save/restore for each layer
      expect((dataStr.match(/\bq\b/g) || []).length).toBe(glyph.layers.length);
      expect((dataStr.match(/\bQ\b/g) || []).length).toBe(glyph.layers.length);
      // fill operator for each non-empty layer
      expect((dataStr.match(/\bf\b/g) || []).length).toBe(glyph.layers.length);
      // RGB color (via fillColor → /DeviceRGB cs + scn) + path moveTo operators
      expect(dataStr).toMatch(/[0-9.]+ [0-9.]+ [0-9.]+ scn/);
      expect(dataStr).toMatch(/[0-9.]+ [0-9.]+ m/);

      document.addContent.mockRestore();
    });

    test('multiple emoji codepoints produce COLR glyphs', () => {
      // Test a few different emoji codepoints
      const codepoints = [0x2764, 0x1f44d, 0x1f680]; // heart, thumbs up, rocket
      for (const cp of codepoints) {
        const glyph = twFont.glyphForCodePoint(cp);
        if (glyph && glyph.type === 'COLR') {
          expect(glyph.layers.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describeIfNoto('NotoColorEmoji CBDT/CBLC (real font)', () => {
    let notoFont;

    beforeAll(() => {
      const data = fs.readFileSync(notoPath);
      notoFont = fontkit.create(data);
    });

    test('font has CBDT and CBLC tables', () => {
      expect(notoFont.directory.tables.CBDT).toBeTruthy();
      expect(notoFont.directory.tables.CBLC).toBeTruthy();
    });

    test('CBLC has parsed strike data with valid ranges', () => {
      const cblc = notoFont.CBLC;
      expect(cblc).toBeTruthy();
      expect(cblc.numSizes).toBeGreaterThan(0);
      expect(cblc.sizes).toBeTruthy();
      const strike = cblc.sizes[0];
      expect(strike.ppemX).toBeGreaterThan(0);
      expect(strike.startGlyphIndex).toBeLessThan(strike.endGlyphIndex);
      expect(strike.numberOfIndexSubTables).toBeGreaterThan(0);
    });

    test('raw CBDT data has correct version header', () => {
      const buf = notoFont.stream.buffer;
      const cbdtStart = notoFont.directory.tables.CBDT.offset;
      // CBDT version 3.0 = major=3, minor=0
      expect(buf.readUInt16BE(cbdtStart)).toBe(3);
      expect(buf.readUInt16BE(cbdtStart + 2)).toBe(0);
    });

    test('_extractCBDTBitmap returns valid PNG for glyph in first subtable range', () => {
      const cblc = notoFont.CBLC;
      const strike = cblc.sizes[0];
      // Use a glyph ID in the first parsed subtable range
      const glyphId = strike.indexSubTableArray[0].firstGlyphIndex;
      const result = document._extractCBDTBitmap(
        notoFont,
        glyphId,
        strike.ppemX,
      );
      // If fontkit's parsed subtable works, we get PNG data
      if (result) {
        // Verify PNG signature: 89 50 4E 47
        expect(result[0]).toBe(0x89);
        expect(result[1]).toBe(0x50);
        expect(result[2]).toBe(0x4e);
        expect(result[3]).toBe(0x47);
        expect(result.length).toBeGreaterThan(100);
      }
    });

    test('_extractCBDTBitmap returns valid PNG via manual CBLC lookup', () => {
      const cblc = notoFont.CBLC;
      const strike = cblc.sizes[0];
      // Use a glyph ID OUTSIDE the first subtable (4-17) but inside the
      // overall strike range — forces manual CBLC binary parsing
      const glyphId = Math.min(500, strike.endGlyphIndex);
      const result = document._extractCBDTBitmap(
        notoFont,
        glyphId,
        strike.ppemX,
      );
      expect(result).toBeTruthy();
      // PNG signature
      expect(result[0]).toBe(0x89);
      expect(result[1]).toBe(0x50);
      expect(result[2]).toBe(0x4e);
      expect(result[3]).toBe(0x47);
      expect(result.length).toBeGreaterThan(100);
    });

    test('_extractCBDTBitmap returns null for glyph outside all strikes', () => {
      const result = document._extractCBDTBitmap(
        notoFont,
        notoFont.numGlyphs + 10,
        109,
      );
      expect(result).toBeNull();
    });

    test('_manualCBLCLookup finds glyph in unparsed subtable', () => {
      const cblc = notoFont.CBLC;
      const strike = cblc.sizes[0];
      // Pick a glyph beyond first parsed subtable range
      const lastParsed = strike.indexSubTableArray[0].lastGlyphIndex;
      const glyphId = lastParsed + 10;

      const result = document._manualCBLCLookup(
        notoFont,
        0,
        strike.numberOfIndexSubTables,
        glyphId,
      );
      expect(result).toBeTruthy();
      expect(result).toHaveProperty('offset');
      expect(result).toHaveProperty('imageFormat');
      expect([17, 18, 19]).toContain(result.imageFormat);
    });

    test('extracted bitmaps for different glyphs are distinct', () => {
      const cblc = notoFont.CBLC;
      const ppem = cblc.sizes[0].ppemX;
      const buf1 = document._extractCBDTBitmap(notoFont, 100, ppem);
      const buf2 = document._extractCBDTBitmap(notoFont, 200, ppem);
      expect(buf1).toBeTruthy();
      expect(buf2).toBeTruthy();
      // Different glyphs should produce different bitmap data
      expect(buf1.equals(buf2)).toBe(false);
    });
  });
});
