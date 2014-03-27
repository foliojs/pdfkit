# Getting Started with PDFKit

### Installation

Installation uses the [npm](http://npmjs.org/) package manager. Just type the
following command after installing npm.
    
    npm install pdfkit

### Creating a document

Creating a PDFKit document is quite simple. Just require the `pdfkit` module
in your CoffeeScript or JavaScript source file and create an instance of the
`PDFDocument` class.

    PDFDocument = require 'pdfkit'
    doc = new PDFDocument
    
`PDFDocument` instances are readable Node streams. They don't get saved anywhere automatically,
but you can call the `pipe` method to send the output of the PDF document to another
writable Node stream as it is being written. When you're done with your document, call
the `end` method to finalize it. Here is an example showing how to pipe to a file or an HTTP response.

    doc.pipe fs.createWriteStream('/path/to/file.pdf') # write to PDF
    doc.pipe fs.createWriteStream(res)                 # HTTP response
    
    # add stuff to PDF here using methods described below...
    
    doc.end() # finalize the PDF and end the stream
    
The `write` and `output` methods found in PDFKit before version 0.5 are now deprecated.

### Adding pages

The first page of a PDFKit document is added for you automatically when you
create the document. Subsequent pages must be added by you. Luckily, it is
quite simple!
    
    doc.addPage()

You can also set some options for the page, such as it's size and orientation.

The `layout` property can be either `portrait` (the default) or `landscape`.
The `size` property can be either an array specifying `[width, height]` in PDF
points (72 per inch), or a string specifying a predefined size. A
list of the predefined paper sizes can be seen [here](http://pdfkit.org/docs/paper_sizes.html). The
default is `letter`.

Passing a page options object to the `PDFDocument` constructor will
set the default paper size and layout for every page in the document, which is
then overridden by individual options passed to the `addPage` method.

You can set the page margins in two ways. The first is by setting the `margin` 
property (singular) to a number, which applies that margin to all edges. The
other way is to set the `margins` property (plural) to an object with `top`,
`bottom`, `left`, and `right` values.  The default is a 1 inch (72 point) margin
on all sides.

For example:

    # Add a 50 point margin on all sides
    doc.addPage
      margin: 50

      
    # Add different margins on each side
    doc.addPage
      margins: { top: 50, bottom: 50, left: 72, right: 72 }

### Setting document metadata

PDF documents can have various metadata associated with them, such as the
title, or author of the document. You can add that information by adding it to
the `doc.info` object, or by passing an info object into the document at
creation time.

Here is a list of all of the properties you can add to the document metadata.
According to the PDF spec, each property must have it's first letter
capitalized.

  * `Title` - the title of the document
  * `Author` - the name of the author
  * `Subject` - the subject of the document
  * `Keywords` - keywords associated with the document
  * `CreationDate` - the date the document was created (added automatically by PDFKit)
  * `ModDate` - the date the document was last modified

### Adding content

Once you've created a `PDFDocument` instance, you can add content to the
document. Check out the other sections described in this document to
learn about each type of content you can add.

That's the basics! Now let's move on to PDFKit's powerful vector graphics
abilities.
