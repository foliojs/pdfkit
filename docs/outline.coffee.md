# Outlines in PDFKit

Outlines are the heirachical bookmarks that display in some PDF readers. Currently only page bookmarks are supported, but more may be added in the future. They are simple to add and only require a few methods:

* `addOutline(title)`
* `addSublevelOutline(title)`
* `endOutlineSublevel()`
* `getOutlineLevel()`

Here is an example of adding a bookmark with a single child bookmark.

    # Add some text
    doc.fontSize(25)
       .text('Parent', 20, 0)
       .addOutline('Parent')
       
    doc.addPage()

    # Add the child bookmark
    doc.text('Child', 20, 0)
        .addSublevelOutline('Child')
