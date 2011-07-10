# PDFKit

## Description

A PDF generation library for Node.js inspired by [Prawn](http://prawn.majesticseacreature.com/).

PDFKit is written in [CoffeeScript](http://coffeescript.org/), but you can choose to use the API with either 
CoffeeScript or JavaScript.  It works just as well with either language!  The API is chainable for ease of use, 
and abstracts the complexity of accomplishing many tasks in the PDF format.

## Features

* Vector graphics
  * HTML5 canvas-like API
  * Path operations
  * SVG path parser for easy path creation
  * Transformations
* Text
  * Line wrapping
  * Text alignments
  * Bulleted lists
* Font embedding
  * Supports TrueType (.ttf), TrueType Collections (.ttc), and Datafork TrueType (.dfont) fonts
* Image embedding
  * Supports JPEG and PNG files (including indexed PNGs, and PNGs with transparency)
* Annotations
  * Links
  * Notes
  * Highlights
  * Underlines
  * etc.
  
## Coming soon!

* Gradients and patterns
* Outlines
* PDF Security
* Font subsetting
* Higher level APIs for creating tables and laying out content
* More performance optimizations
* Even more awesomeness, perhaps written by you! Please fork this repository and send me pull requests.

## Installation

Installation uses the [npm](http://npmjs.org/) package manager.  Just type the following command after installing npm.

    npm install pdfkit
    
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
       .text 'Here is some vector graphics...', 100, 100

    # Draw a triangle
    doc.save()
       .moveTo(100, 150)
       .lineTo(100, 250)
       .lineTo(200, 250)
       .fill("#FF3300")
    
    # Apply some transforms and render an SVG path with the 'even-odd' fill rule
    doc.scale(0.6)
       .translate(470, -380)
       .path('M 250,75 L 323,301 131,161 369,161 177,301 z') # render an SVG path
       .fill('red', 'even-odd')
       .restore()
      
    # Add some text with annotations            
    doc.addPage()
       .fillColor("blue")
       .text('Here is a link!', 100, 100)
       .underline(100, 100, 160, 27, color: "#0000FF")
       .link(100, 100, 160, 27, 'http://google.com/')
     
For more, see the `demo` folder.

## Documentation

For complete API documentation and more examples, see the [PDFKit website](http://devongovett.github.com/pdfkit).

## License

PDFKit is licensed under the MIT license.