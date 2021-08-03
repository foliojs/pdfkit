# pdfkit-webpack-example

Simple example of using PdfKit with webpack

### Features

- Minimal webpack 5 setup
- Automatically register binary files added to static-assets folder
- Register AFM fonts provided by pdfkit
- Shows how to load and register files lazily

### Technical details

[`webpack.config.js`](webpack.config.js)

- add alias to map `fs` calls to pdfkit virtual file system [implementation](../../lib/virtual-fs.js)
- ignore iconv-lite and crypto packages to save bundle file size
- add aliases to native node packages (buffer, stream, zlib, util, assert)
- configure `*.afm` files to be imported as text
- configure all files in `src/static-assets` folder to be imported encoded as base64
- configure all files in `src/lazy-assets` folder to be imported as URLs
- convert binary files used by linebreak and fontkit to base64

### Caveats

The strategy to register binary files and AFM fonts inlines them in source code, increasing the bundle size significantly
