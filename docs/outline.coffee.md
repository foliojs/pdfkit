# Outlines in PDFKit

Outlines are the heirachical bookmarks that display in some PDF readers. Currently only page bookmarks are supported, but more may be added in the future. They are simple to add and only require a single method:

* `addItem(title)`

Here is an example of adding a bookmark with a single child bookmark.

    # Get a reference to the Outline root
    outline = doc.outline

    # Add a top-level bookmark
    top = outline.addItem('Top Level')

    # Add a sub-section
    top.addItem('Sub-section')
