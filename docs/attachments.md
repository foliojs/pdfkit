# Attachments in PDFKit

## Embedded Files

Embedded files make it possible to embed any external file into a PDF.
Adding an embedded file is as simple as calling the `file` method and specifying a filepath.

    doc.file(path.join(__dirname, 'example.txt'))

It is also possible to embed data directly as a Buffer, ArrayBuffer or base64 encoded string.
If you are embedding data, it is recommended you also specify a filename like this:

    doc.file(Buffer.from('this will be a text file'), { name: 'example.txt' })

When embedding a data URL, the `type` option will be set to the data URL's MIME type automatically:

    doc.file('data:text/plain;base64,YmFzZTY0IHN0cmluZw==', { name: 'base64.txt' })

There are a few other options for `doc.file`:

* `name` - specify the embedded file's name
* `type` - specify the embedded file's subtype as a [MIME-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
* `description` - add descriptive text for the embedded file
* `hidden` - if true, do not show file in the list of embedded files
* `creationDate` - override the date and time the file was created
* `modifiedDate` - override the date and time the file was last updated
* `relationship` - relationship between the PDF document and its attached file. Can be 'Alternative', 'Data', 'Source', 'Supplement' or 'Unspecified'.

If you are attaching a file from your file system, creationDate and modifiedDate will be set to the source file's creationDate and modifiedDate.

Setting the `hidden` option prevents this file from showing up in the pdf viewer's attachment panel.
While this may not be very useful for embedded files, it is absolutely necessary for file annotations, to prevent them from showing up twice in the attachment panel.

## File Annotations

A file annotation contains a reference to an embedded file that can be placed anywhere in the document.
File annotations show up in your reader's annotation panel as well as the attachment panel.

In order to add a file annotation, you should first read the chapter on annotations.
Like other annotations, you specify position and size with `x`, `y`, `width` and `height`, unlike other annotations you must also specify a file object.
The file object may contain the same options as `doc.file` in the previous section with the addition of the source file or buffered data in `src`.

Here is an example of adding a file annotation:

    const file = {
      src: path.join(__dirname, 'example.txt'),
      name: 'example.txt',
      description: 'file annotation description'
    }
    const options = { Name: 'Paperclip' }

    doc.fileAnnotation(100, 100, 100, 100, file, options)

The annotation's appearance may be changed by setting the `Name` option to one of the three predefined icons `GraphPush`, `Paperclip` or `Push` (default value).
