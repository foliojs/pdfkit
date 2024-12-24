# Getting Started with PDFKit

### Installation

Installation uses the [npm](http://npmjs.org/) package manager. Just type the
following command after installing npm.

    npm install pdfkit

### Creating a document

Creating a PDFKit document is quite simple. Just require the `pdfkit` module
in your JavaScript source file and create an instance of the
`PDFDocument` class.

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

`PDFDocument` instances are readable Node streams. They don't get saved anywhere automatically,
but you can call the `pipe` method to send the output of the PDF document to another
writable Node stream as it is being written. When you're done with your document, call
the `end` method to finalize it. Here is an example showing how to pipe to a file or an HTTP response.

    doc.pipe(fs.createWriteStream('/path/to/file.pdf')); // write to PDF
    doc.pipe(res);                                       // HTTP response

    // add stuff to PDF here using methods described below...

    // finalize the PDF and end the stream
    doc.end();

The `write` and `output` methods found in PDFKit before version 0.5 are now deprecated.

## Using PDFKit in the browser

PDFKit can be used in the browser as well as in Node! There are two ways to use PDFKit in the browser.
The first is to create an app using an module bundler like [Browserify](http://browserify.org/) or [Webpack](https://webpack.js.org/).
The second is to create a standalone pdfkit script as explained [here](https://github.com/foliojs/pdfkit/wiki/How-to-compile-standalone-PDFKit-for-use-in-the-browser).

Using PDFKit in the browser is exactly the same as using it in Node, except you'll want to pipe the
output to a destination supported in the browser, such as a
[Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob). Blobs can be used
to generate a URL to allow display of generated PDFs directly in the browser via an `iframe`, or they can
be used to upload the PDF to a server, or trigger a download in the user's browser.

To get a Blob from a `PDFDocument`, you should pipe it to a [blob-stream](https://github.com/devongovett/blob-stream),
which is a module that generates a Blob from any Node-style stream. The following example uses Browserify to load
`PDFKit` and `blob-stream`, but if you're not using Browserify, you can load them in whatever way you'd like (e.g. script tags).

    // require dependencies
    const PDFDocument = require('pdfkit');
    const blobStream  = require('blob-stream');

    // create a document the same way as above
    const doc = new PDFDocument;

    // pipe the document to a blob
    const stream = doc.pipe(blobStream());

    // add your content to the document here, as usual

    // get a blob when you're done
    doc.end();
    stream.on('finish', function() {
      // get a blob you can do whatever you like with
      const blob = stream.toBlob('application/pdf');

      // or get a blob URL for display in the browser
      const url = stream.toBlobURL('application/pdf');
      iframe.src = url;
    });

You can see an interactive in-browser demo of PDFKit [here](http://pdfkit.org/demo/browser.html).

Note that in order to Browserify a project using PDFKit, you need to install the `brfs` module with npm,
which is used to load built-in font data into the package. It is listed as a `devDependencies` in
PDFKit's `package.json`, so it isn't installed by default for Node users.
If you forget to install it, Browserify will print an error message.

## Adding pages

The first page of a PDFKit document is added for you automatically when you
create the document unless you provide `autoFirstPage: false`. Subsequent pages must be added by you. Luckily, it is
quite simple!

    doc.addPage()

To add some content every time a page is created, either by calling `addPage()` or automatically, you can use the `pageAdded` event.

    doc.on('pageAdded', () => doc.text("Page Title"));

You can also set some options for the page, such as its size and orientation.

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
`bottom`, `left`, and `right` values. The default is a 1 inch (72 point) margin
on all sides.

For example:

    // Add a 50 point margin on all sides
    doc.addPage({
      margin: 50});


    // Add different margins on each side
    doc.addPage({
      margins: {
        top: 50,
        bottom: 50,
        left: 72,
        right: 72
      }
    });

## Switching to previous pages

PDFKit normally flushes pages to the output file immediately when a new page is created, making
it impossible to jump back and add content to previous pages. This is normally not an issue, but
in some circumstances it can be useful to add content to pages after the whole document, or a part
of the document, has been created already. Examples include adding page numbers, or filling in other
parts of information you don't have until the rest of the document has been created.

PDFKit has a `bufferPages` option in versions v0.7.0 and later that allows you to control when
pages are flushed to the output file yourself rather than letting PDFKit handle that for you. To use
it, just pass `bufferPages: true` as an option to the `PDFDocument` constructor. Then, you can call
`doc.switchToPage(pageNumber)` to switch to a previous page (page numbers start at 0).

When you're ready to flush the buffered pages to the output file, call `flushPages`.
This method is automatically called by `doc.end()`, so if you just want to buffer all pages in the document, you
never need to call it. Finally, there is a `bufferedPageRange` method, which returns the range
of pages that are currently buffered. Here is a small example that shows how you might add page
numbers to a document.

    // create a document, and enable bufferPages mode
    let i;
    let end;
    const doc = new PDFDocument({
      bufferPages: true});

    // add some content...
    doc.addPage();
    // ...
    doc.addPage();

    // see the range of buffered pages
    const range = doc.bufferedPageRange(); // => { start: 0, count: 2 }

    for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
      doc.switchToPage(i);
      doc.text(`Page ${i + 1} of ${range.count}`);
    }

    // manually flush pages that have been buffered
    doc.flushPages();

    // or, if you are at the end of the document anyway,
    // doc.end() will call it for you automatically.
    doc.end();

## Setting default font

The default font is 'Helvetica'. It can be configured by passing `font` option

    // use Courier font by default
    const doc = new PDFDocument({font: 'Courier'});

## Setting document metadata

PDF documents can have various metadata associated with them, such as the
title, or author of the document. You can add that information by adding it to
the `doc.info` object, or by passing an info object into the document at
creation time.

Here is a list of all of the properties you can add to the document metadata.
According to the PDF spec, each property must have its first letter
capitalized.

- `Title` - the title of the document
- `Author` - the name of the author
- `Subject` - the subject of the document
- `Keywords` - keywords associated with the document
- `CreationDate` - the date the document was created (added automatically by PDFKit)
- `ModDate` - the date the document was last modified

## Encryption and Access Privileges

PDF specification allow you to encrypt the PDF file and require a password when opening the file,
and/or set permissions of what users can do with the PDF file. PDFKit implements standard security
handler in PDF version 1.3 (40-bit RC4), version 1.4 (128-bit RC4), PDF version 1.7 (128-bit AES),
and PDF version 1.7 ExtensionLevel 3 (256-bit AES).

To enable encryption, provide a user password when creating the `PDFDocument` in `options` object.
The PDF file will be encrypted when a user password is provided, and users will be prompted to enter
the password to decrypt the file when opening it.

- `userPassword` - the user password (string value)

To set access privileges for the PDF file, you need to provide an owner password and permission
settings in the `option` object when creating `PDFDocument`. By default, all operations are disallowed.
You need to explicitly allow certain operations.

- `ownerPassword` - the owner password (string value)
- `permissions` - the object specifying PDF file permissions

Following settings are allowed in `permissions` object:

- `printing` - whether printing is allowed. Specify `"lowResolution"` to allow degraded printing, or `"highResolution"` to allow printing with high resolution
- `modifying` - whether modifying the file is allowed. Specify `true` to allow modifying document content
- `copying` - whether copying text or graphics is allowed. Specify `true` to allow copying
- `annotating` - whether annotating, form filling is allowed. Specify `true` to allow annotating and form filling
- `fillingForms` - whether form filling and signing is allowed. Specify `true` to allow filling in form fields and signing
- `contentAccessibility` - whether copying text for accessibility is allowed. Specify `true` to allow copying for accessibility
- `documentAssembly` - whether assembling document is allowed. Specify `true` to allow document assembly

You can specify either user password, owner password or both passwords.
Behavior differs according to passwords you provides:

- When only user password is provided,
  users with user password are able to decrypt the file and have full access to the document.
- When only owner password is provided,
  users are able to decrypt and open the document without providing any password,
  but the access is limited to those operations explicitly permitted.
  Users with owner password have full access to the document.
- When both passwords are provided,
  users with user password are able to decrypt the file
  but only have limited access to the file according to permission settings.
  Users with owner password have full access to the document.

Note that PDF file itself cannot enforce access privileges.
When file is decrypted, PDF viewer applications have full access to the file content,
and it is up to viewer applications to respect permission settings.

To choose encryption method, you need to specify PDF version.
PDFKit will choose best encryption method available in the PDF version you specified.

- `pdfVersion` - a string value specifying PDF file version

Available options includes:

- `1.3` - PDF version 1.3 (default), 40-bit RC4 is used
- `1.4` - PDF version 1.4, 128-bit RC4 is used
- `1.5` - PDF version 1.5, 128-bit RC4 is used
- `1.6` - PDF version 1.6, 128-bit AES is used
- `1.7` - PDF version 1.7, 128-bit AES is used
- `1.7ext3` - PDF version 1.7 ExtensionLevel 3, 256-bit AES is used

When using PDF version 1.7 ExtensionLevel 3, password is truncated to 127 bytes of its UTF-8 representation.
In older versions, password is truncated to 32 bytes, and only Latin-1 characters are allowed.

## PDF/A

PDF/A is a standard (ISO 19005-1:2005) which defines rules for electornic documents intended for long-term archiving.
The restrictions on PDF/A documents are:

- Cannot be encrypted
- Fonts must be embedded
- No JavaScript
- No audio content
- No video content
- Addition of XMP metadata
- Must define color spaces

Currently, PDFKit aims to support PDF/A-1b, PDF/A-2b, PDF/A-3b and PDF/A-1a, PDF/A-2a, PDF/A-3a standards, also known as level B conformance and level A conformance, respectively.

In order to create PDF/A documents, set `subset` to either `PDF/A-1` or `PDF/A-1b` for level B (basic) conformance, or `PDF/A-1a` for level A (accessible) conformance when creating the `PDFDocument` in `options` object.

Similary, use `PDF/A-2` or `PDF/A-2b` for PDF/A-2 level B conformance and `PDF/A-2a` for PDF/A-2 level A conformance. `PDF/A-3` or `PDF/A-3b` can be used for PDF/A-3 level B conformance and `PDF/A-3a` for PDF/A-3 level A conformance.

Futhermore, you will need to specify the other options relevant to the PDF/A subset you wish to use, for PDF/A-1 being:

- `pdfVersion` set to at least `1.4`
- `tagged` set to `true` for PDF/A-1a

For PDF/A-2 and PDF/A-3, the `pdfVersion` needs to be set to at least `1.7` and `tagged` needs to be `true` for level A conformance.

In order to verify the generated document for PDF/A and its subsets conformance, veraPDF is an excellent open source validator.

Please note that PDF/A requires fonts to be embedded, as such the standard fonts PDFKit comes with cannot be used because they are in AFM format, which only provides neccessary metrics, without the font data. You should use `registerFont()` and use embeddable fonts such as `ttf`.

### Adding content

Once you've created a `PDFDocument` instance, you can add content to the
document. Check out the other sections described in this document to
learn about each type of content you can add.

That's the basics! Now let's move on to PDFKit's powerful vector graphics
abilities.
