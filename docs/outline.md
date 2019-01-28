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

The `options` parameter currently only has one property: `expanded`. If this value is set to `true` then all of that section's children will be visible by default. This value defaults to `false`. 

In this example the 'Top Level' section will be expanded to show 'Sub-section'.

    // Add a top-level bookmark
    const top = outline.addItem('Top Level', { expanded: true });

    // Add a sub-section
    top.addItem('Sub-section');