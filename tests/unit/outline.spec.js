import PDFDocument from '../../lib/document';

describe('PDFOutline', () => {
  describe('PageMode', () => {
    test('sets PageMode to UseOutlines when not already set', () => {
      const doc = new PDFDocument();

      doc.outline.addItem('Test');
      doc.end();

      expect(doc._root.data.PageMode).toBe('UseOutlines');
    });

    test('preserves existing PageMode when already set', () => {
      const doc = new PDFDocument();
      doc._root.data.PageMode = 'FullScreen';

      doc.outline.addItem('Test');
      doc.end();

      expect(doc._root.data.PageMode).toBe('FullScreen');
    });
  });

  describe('addItem', () => {
    test('creates outline item for current page by default', () => {
      const doc = new PDFDocument();
      const outline = doc.outline;

      // Add first page content
      doc.text('Page 1');

      // Add outline item (should point to page 1)
      const item = outline.addItem('Chapter 1');

      expect(item.outlineData.Dest[0]).toBe(doc.page.dictionary);
    });

    test('creates outline item for specific page when pageNumber is provided', () => {
      const doc = new PDFDocument();
      const outline = doc.outline;

      // Create multiple pages
      doc.text('Page 1');
      doc.addPage();
      doc.text('Page 2');
      doc.addPage();
      doc.text('Page 3');

      // Add outline item pointing to page 1 (index 0)
      const item1 = outline.addItem('Chapter 1', { pageNumber: 0 });
      // Add outline item pointing to page 2 (index 1)
      const item2 = outline.addItem('Chapter 2', { pageNumber: 1 });

      // Get page references
      const pages = doc._root.data.Pages.data.Kids;

      expect(item1.outlineData.Dest[0]).toBe(pages[0]);
      expect(item2.outlineData.Dest[0]).toBe(pages[1]);
    });

    test('falls back to current page when pageNumber is null', () => {
      const doc = new PDFDocument();
      const outline = doc.outline;

      doc.text('Page 1');
      doc.addPage();
      doc.text('Page 2');

      // pageNumber: null should use current page (page 2)
      const item = outline.addItem('Current Page', { pageNumber: null });

      expect(item.outlineData.Dest[0]).toBe(doc.page.dictionary);
    });

    test('supports nested outline items with page numbers', () => {
      const doc = new PDFDocument();
      const outline = doc.outline;

      doc.text('Page 1');
      doc.addPage();
      doc.text('Page 2');
      doc.addPage();
      doc.text('Page 3');

      const pages = doc._root.data.Pages.data.Kids;

      // Create parent pointing to page 1
      const parent = outline.addItem('Part 1', { pageNumber: 0 });
      // Create child pointing to page 2
      const child = parent.addItem('Chapter 1', { pageNumber: 1 });

      expect(parent.outlineData.Dest[0]).toBe(pages[0]);
      expect(child.outlineData.Dest[0]).toBe(pages[1]);
    });
  });

  describe('destination type', () => {
    test('uses Fit destination by default', () => {
      const doc = new PDFDocument();
      const outline = doc.outline;

      doc.text('Page 1');
      const item = outline.addItem('Chapter 1');

      expect(item.outlineData.Dest[1]).toBe('Fit');
    });

    test('uses XYZ destination with position and zoom options', () => {
      const doc = new PDFDocument();
      const outline = doc.outline;

      doc.text('Page 1');
      const item = outline.addItem('Chapter 1', {
        fit: false,
        top: 100,
        left: 50,
        zoom: 1.5,
      });

      expect(item.outlineData.Dest[1]).toBe('XYZ');
      // XYZ format: [page, 'XYZ', left, top, zoom]
      expect(item.outlineData.Dest[4]).toBe(1.5); // zoom
    });

    test('uses Fit destination when fit option is true', () => {
      const doc = new PDFDocument();
      const outline = doc.outline;

      doc.text('Page 1');
      const item = outline.addItem('Chapter 1', {
        fit: true,
        top: 100, // should be ignored when fit is true
      });

      expect(item.outlineData.Dest[1]).toBe('Fit');
      expect(item.outlineData.Dest.length).toBe(2);
    });

    test('calculates XYZ coordinates correctly', () => {
      const doc = new PDFDocument({ size: [612, 792] }); // Letter size
      const outline = doc.outline;

      doc.text('Page 1');
      const item = outline.addItem('Chapter 1', {
        fit: false,
        top: 100,
        left: 50,
        zoom: 0,
      });

      // XYZ format: [page, 'XYZ', left, top, zoom]
      // left = pageWidth - options.left = 612 - 50 = 562
      // top = pageHeight - options.top = 792 - 100 = 692
      expect(item.outlineData.Dest[2]).toBe(562); // left
      expect(item.outlineData.Dest[3]).toBe(692); // top
      expect(item.outlineData.Dest[4]).toBe(0); // zoom
    });
  });
});
