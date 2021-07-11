# pdfkit-webpack-example

Simple example of using PdfKit with webpack

### Features

- Minimal webpack 5 setup
- Automatically register binary files added to static-assets folder
- Register AFM fonts provided by pdfkit
- Shows how to load and register files lazily

### Caveats

Production build does not work. Probably how pdf document is created (inside a `new Function` call)
