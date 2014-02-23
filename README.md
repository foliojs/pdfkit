# PDFKit
### A PDF generation library for Node.js.

## Description

PDFKit is a PDF document generation library for Node that makes creating complex, multi-page, printable documents easy. 
It's written in CoffeeScript, but you can choose to use the API in plain 'ol JavaScript if you like. The API embraces 
chainability, and includes both low level functions as well as abstractions for higher level functionality. The PDFKit API 
is designed to be simple, so generating complex documents is often as simple as a few function calls.

Check out some of the [documentation and examples](http://pdfkit.org/docs/getting_started.html) to see for yourself!
You can also read the guide as a [self-generated PDF](http://pdfkit.org/docs/guide.pdf) with example output displayed inline.
If you'd like to see how it was generated, check out the README in the [docs](https://github.com/devongovett/pdfkit/tree/master/docs)
folder.

## Installation

Installation uses the [npm](http://npmjs.org/) package manager.  Just type the following command after installing npm.

    npm install pdfkit

## Features

* Vector graphics
  * HTML5 canvas-like API
  * Path operations
  * SVG path parser for easy path creation
  * Transformations
  * Linear and radial gradients
* Text
  * Line wrapping
  * Text alignments
  * Bulleted lists
* Font embedding
  * Supports TrueType (.ttf), TrueType Collections (.ttc), and Datafork TrueType (.dfont) fonts
  * Font subsetting
* Image embedding
  * Supports JPEG and PNG files (including indexed PNGs, and PNGs with transparency)
* Annotations
  * Links
  * Notes
  * Highlights
  * Underlines
  * etc.
  
## Coming soon!

* Patterns fills
* Outlines
* PDF Security
* Higher level APIs for creating tables and laying out content
* More performance optimizations
* Even more awesomeness, perhaps written by you! Please fork this repository and send me pull requests.
    
## Example

    PDFDocument = require 'pdfkit'
    doc = new PDFDocument

    # Embed a font, set the font size, and render some text
    doc.font('fonts/PalatinoBold.ttf')
       .fontSize(25)
       .text('Some text with an embedded font!', 100, 100)

    # Add another page
    doc.addPage()
       .fontSize(25)
       .text('Here is some vector graphics...', 100, 100)

    # Draw a triangle
    doc.save()
       .moveTo(100, 150)
       .lineTo(100, 250)
       .lineTo(200, 250)
       .fill("#FF3300")

    # Apply some transforms and render an SVG path with the 'even-odd' fill rule
    doc.scale(0.6)
       .translate(470, -380)
       .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
       .fill('red', 'even-odd')
       .restore()

    # Add some text with annotations
    doc.addPage()
       .fillColor("blue")
       .text('Here is a link!', 100, 100)
       .underline(100, 100, 160, 27, color: "#0000FF")
       .link(100, 100, 160, 27, 'http://google.com/')

    # Write the PDF file to disk
    doc.write 'output.pdf'
     
[The PDF output from this example](http://pdfkit.org/demo/out.pdf) (with a few additions) shows the power of PDFKit — producing 
complex documents with a very small amount of code.  For more, see the `demo` folder and the 
[PDFKit programming guide](http://pdfkit.org/docs/getting_started.html).

## Documentation

For complete API documentation and more examples, see the [PDFKit website](http://pdfkit.org/).

## License

PDFKit is available under the MIT license.