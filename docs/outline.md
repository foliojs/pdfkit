# Outlines in PDFKit

Outlines are the heirachical bookmarks that display in some PDF readers. Currently only page bookmarks are supported, but more may be added in the future. They are simple to add and only require a single method:

* `addItem(title, options)`

Here is an example of adding a bookmark with a single child bookmark.

    // Get a reference to the Outline root
    const { outline } = doc;

    // Add a top-level bookmark
    const top = outline.addItem('Top Level');

    // Add a sub-section
    top.addItem('Sub-section');

## Options

The `options` parameter supports the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `expanded` | boolean | `false` | Show children by default |
| `pageNumber` | number | `null` | Link to specific page by index (0-based). If `null`, links to current page |
| `fit` | boolean | `true` | Use `Fit` destination (fit entire page in window) |
| `top` | number | `0` | Top position for `XYZ` destination (requires `fit: false`) |
| `left` | number | `0` | Left position for `XYZ` destination (requires `fit: false`) |
| `zoom` | number | `0` | Zoom level for `XYZ` destination (0 = current zoom, requires `fit: false`) |

### Expanded sections

If `expanded` is set to `true`, all of that section's children will be visible by default.

    // Add a top-level bookmark
    const top = outline.addItem('Top Level', { expanded: true });

    // Add a sub-section
    top.addItem('Sub-section');

### Link to a specific page

Use `pageNumber` to link to a specific page by its index (0-based).

    doc.text('Page 1');
    doc.addPage();
    doc.text('Page 2');
    doc.addPage();
    doc.text('Page 3');

    // Link to page 1 (index 0)
    outline.addItem('Chapter 1', { pageNumber: 0 });
    // Link to page 2 (index 1)
    outline.addItem('Chapter 2', { pageNumber: 1 });

### Custom position and zoom (XYZ destination)

Set `fit: false` to use XYZ destination with custom position and zoom level.

    // Jump to top-left corner of the page with 150% zoom
    outline.addItem('Section 1', {
      fit: false,
      top: 0,
      left: 0,
      zoom: 1.5
    });

    // Jump to a specific position (100pt from top)
    outline.addItem('Section 2', {
      pageNumber: 1,
      fit: false,
      top: 100,
      left: 0,
      zoom: 0  // 0 means keep current zoom level
    });
