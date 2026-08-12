# pdfkit-webpack-example

Simple example of using PdfKit with webpack

### Features

- Minimal webpack 5 setup
- Bundle binary files added to static-assets folder
- Register standard fonts provided by pdfkit
- Shows how to load files lazily

### Technical details

[`webpack.config.js`](webpack.config.js)

- ignore crypto package to save bundle file size
- add aliases to native node packages (buffer, stream, zlib, util, assert)
- configure all files in `src/static-assets` folder to be imported encoded as base64
- configure all files in `src/lazy-assets` folder to be imported as URLs
- convert binary files used by linebreak and fontkit to base64

### Caveats

The strategy to bundle binary files and standard fonts inlines them in source code, increasing the bundle size significantly
