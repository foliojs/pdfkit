# PDFKit Guide

The PDFKit guide can be read a number of ways.  The first is online at [pdfkit.org](http://pdfkit.org/).
You can also read the guide in PDF form, in this directory or [online](http://pdfkit.org/docs/guide.pdf).

Both the website and the PDF guide are generated from the Literate CoffeeScript (runnable Markdown) files
in this directory. The examples are actually run when generating the PDF in order to show the results inline.
The `generate.coffee` file in this directory is actually quite short.  It parses the markdown files into a 
tree structure using [markdown-js](https://github.com/evilstreak/markdown-js), syntax highlights the code
examples using [codemirror](https://github.com/marijnh/codemirror), compiles and runs the code examples and puts the results
inline, and generates the PDF using PDFKit. You can read the generator script source code to get a feeling for 
how you might do something slightly more complex than the guide itself shows.

The markdown syntax used is pretty much standard, with a couple tweaks.

1. Code example output is references using the image notation, using the alt text as the example number starting from 
    zero in the current file, and the title as the example output height. E.g. `![x](name "height")`.
  
2. Page breaks are added before `h1` and `h2`s, unless there are two in a row. `h3` is treated the same as `h2` but
    can be used to avoid this in the case you need multiple `h2`s on the same page.

3. The horizontal rule syntax (`* * *`) denotes an explicit page break
