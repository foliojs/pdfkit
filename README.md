# PDFKit

A JavaScript PDF generation library for Node and the browser.

## Description

PDFKit is a PDF document generation library for Node and the browser that makes creating complex, multi-page, printable
documents easy. The API embraces chainability, and includes both low level functions as well as abstractions for higher
level functionality. The PDFKit API is designed to be simple, so generating complex documents is often as simple as
a few function calls.

Check out some of the [documentation and examples](http://pdfkit.org/docs/getting_started.html) to see for yourself!
You can also read the guide as a [self-generated PDF](http://pdfkit.org/docs/guide.pdf) with example output displayed inline.
If you'd like to see how it was generated, check out the README in the [docs](https://github.com/foliojs/pdfkit/tree/master/docs)
folder.

You can also try out an interactive in-browser demo of PDFKit [here](http://pdfkit.org/demo/browser.html).

## Installation

Use [npm](http://npmjs.org/) or [yarn](https://yarnpkg.com/) package manager. Just type the following command:

```bash
# with npm
npm install pdfkit

# with yarn
yarn add pdfkit
```

## Features

- Vector graphics
  - HTML5 canvas-like API
  - Path operations
  - SVG path parser for easy path creation
  - Transformations
  - Linear and radial gradients
- Text
  - Line wrapping (with soft hyphen recognition)
  - Text alignments
  - Bulleted lists
- Font embedding
  - Supports TrueType (.ttf), OpenType (.otf), WOFF, WOFF2, TrueType Collections (.ttc), and Datafork TrueType (.dfont) fonts
  - Font subsetting
  - See [fontkit](http://github.com/foliojs/fontkit) for more details on advanced glyph layout support.
- Image embedding
  - Supports JPEG and PNG files (including indexed PNGs, and PNGs with transparency)
- Tables
- Annotations
  - Links
  - Notes
  - Highlights
  - Underlines
  - etc.
- AcroForms
- Outlines
- PDF security
  - Encryption
  - Access privileges (printing, copying, modifying, annotating, form filling, content accessibility, document assembly)
- Accessibility support (marked content, logical structure, Tagged PDF, PDF/UA)

## Coming soon!

- Patterns fills
- Higher level APIs for laying out content
- More performance optimizations
- Even more awesomeness, perhaps written by you! Please fork this repository and send me pull requests.

## Example

Both `const PDFDocument = require('pdfkit')` and
`import PDFDocument from 'pdfkit'` remain supported for backward compatibility.
New code should prefer the named `PDFDocument` export, which will make a future
migration to an ESM-only package more straightforward.

```javascript
const { PDFDocument } = require('pdfkit');
const fs = require('fs');

// Create a document
const doc = new PDFDocument();

// Pipe its output somewhere, like to a file or HTTP response
// See below for browser usage
doc.pipe(fs.createWriteStream('output.pdf'));

// Embed a font, set the font size, and render some text
doc
  .font('fonts/PalatinoBold.ttf')
  .fontSize(25)
  .text('Some text with an embedded font!', 100, 100);

// Add an image, constrain it to a given size, and center it vertically and horizontally
doc.image('path/to/image.png', {
  fit: [250, 300],
  align: 'center',
  valign: 'center'
});

// Add another page
doc
  .addPage()
  .fontSize(25)
  .text('Here is some vector graphics...', 100, 100);

// Draw a triangle
doc
  .save()
  .moveTo(100, 150)
  .lineTo(100, 250)
  .lineTo(200, 250)
  .fill('#FF3300');

// Apply some transforms and render an SVG path with the 'even-odd' fill rule
doc
  .scale(0.6)
  .translate(470, -380)
  .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
  .fill('red', 'even-odd')
  .restore();

// Add some text with annotations
doc
  .addPage()
  .fillColor('blue')
  .text('Here is a link!', 100, 100)
  .underline(100, 100, 160, 27, { color: '#0000FF' })
  .link(100, 100, 160, 27, 'http://google.com/');

// Finalize PDF file
doc.end();
```

[The PDF output from this example](http://pdfkit.org/demo/out.pdf) (with a few additions) shows the power of PDFKit — producing
complex documents with a very small amount of code. For more, see the `demo` folder and the
[PDFKit programming guide](http://pdfkit.org/docs/getting_started.html).

## Bundling for Node

The Node build loads the metrics of the 14 standard fonts on first use from
`standard-fonts/` next to the built file, and PDF/A output reads the sRGB ICC
profile from `data/` next to it. Both are resolved relative to the built file
inside pdfkit's package directory, which a bundle that inlines pdfkit (esbuild,
rollup, webpack, the AWS CDK's `NodejsFunction`, ...) does not sit in. Pick one
of:

- Mark `pdfkit` as external in the bundler and ship `node_modules/pdfkit` next
  to the bundle. File tracers such as `@vercel/nft` pick up every file pdfkit
  needs.
- Copy pdfkit's `js/standard-fonts` directory next to an ESM bundle, which then
  loads the fonts from there. A CommonJS bundle has no `import.meta.url` to
  resolve against, so this route is not open to it.
- Register the standard fonts the document uses before creating it, the same
  way as in the browser:

  ```javascript
  import { PDFDocument, registerStdFonts } from 'pdfkit';
  import Helvetica from 'pdfkit/standard-fonts/Helvetica';

  registerStdFonts(Helvetica);
  const doc = new PDFDocument();
  ```

  Using a standard font that is neither registered nor loadable throws an
  error naming the font. Fonts read from the file system or passed as data are
  not affected.

PDF/A output additionally reads `data/sRGB_IEC61966_2_1.icc` relative to the
bundle's `import.meta.url`: copy pdfkit's `js/data` directory next to an ESM
bundle, or register the profile under that URL with `registerFile`. A CommonJS
bundle has no `import.meta.url` and says so when PDF/A output is requested.

## Browser Usage

There are three ways to use PDFKit in the browser:

- Use [Browserify](http://browserify.org/). See demo [source code](https://github.com/foliojs/pdfkit/blob/master/examples/browserify/browser.js) and [build script](https://github.com/foliojs/pdfkit/blob/master/package.json#L62)
- Use [webpack](https://webpack.js.org/). See [complete example](https://github.com/foliojs/pdfkit/blob/master/examples/webpack).
- Use prebuilt version. Distributed as `pdfkit.standalone.js` file in the [releases](https://github.com/foliojs/pdfkit/releases) or in the package `js` folder.

In addition to PDFKit, you'll need to collect its output. Browsers provide a
[Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) object for storing
binary data and creating URLs that can be displayed in an iframe, downloaded or
uploaded.

### Experimental output helpers

PDFKit provides experimental `toBlob` and `toBytes` helpers from
`pdfkit/output`. These functions may change before they are stabilized. Call the
selected helper before ending the document so it receives the complete output.

Use `toBlob` when displaying, downloading or uploading the PDF in a browser:

```javascript
import { PDFDocument, registerStdFonts } from 'pdfkit';
import Helvetica from 'pdfkit/standard-fonts/Helvetica';
import HelveticaBold from 'pdfkit/standard-fonts/HelveticaBold';
import { toBlob } from 'pdfkit/output';

registerStdFonts(Helvetica, HelveticaBold);
const doc = new PDFDocument();
const output = toBlob(doc);

// Add your content to the document here, as usual.

doc.end();
const blob = await output;
const url = URL.createObjectURL(blob);
iframe.src = url;

// Revoke the URL when the iframe no longer needs the PDF.
// URL.revokeObjectURL(url);
```

Use `toBytes` instead when a binary API, worker or parser needs one contiguous
`Uint8Array`:

```javascript
import { toBytes } from 'pdfkit/output';

const output = toBytes(doc);
doc.end();
const bytes = await output;
```

The stable, dependency-free alternative is to collect the document's
`Uint8Array` chunks using its events and construct the Blob directly:

```javascript
const chunks = [];

doc.on('data', chunk => chunks.push(chunk));
doc.on('end', () => {
  const blob = new Blob(chunks, { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  iframe.src = url;
});

// Add your content to the document here, as usual.
doc.end();
```

You can see an interactive in-browser demo of PDFKit [here](http://pdfkit.org/demo/browser.html).

The browser build has no access to the file system. You can register a
`Uint8Array` under a path before passing that exact path to `registerFont`,
`image` or `file`:

```javascript
import { PDFDocument, registerFile } from 'pdfkit';

const response = await fetch('/fonts/Roboto-Regular.ttf');
const fontData = new Uint8Array(await response.arrayBuffer());

registerFile('fonts/Roboto-Regular.ttf', fontData);

const doc = new PDFDocument();

// register an alias for the font path
doc.registerFont('Roboto', 'fonts/Roboto-Regular.ttf');
// or use the path directly
doc.font('fonts/Roboto-Regular.ttf');

// Optionally unregister the path when it is no longer needed.
registerFile('fonts/Roboto-Regular.ttf', undefined);
```

Registration is global to the loaded PDFKit module. Registering the same path
again replaces its data. In Node, registered data takes precedence over a file at
the same path; unregistering it restores normal file system lookup. Both APIs
are available as named exports from the CommonJS entry point:

```javascript
const { PDFDocument, registerFile } = require('pdfkit');

registerFile('files/example.txt', new Uint8Array([1, 2, 3]), {
  birthtime: new Date('2020-01-02T03:04:05Z'),
  ctime: new Date('2021-02-03T04:05:06Z'),
});
registerFile('files/example.txt', undefined);
```

`registerFile` accepts only a `Uint8Array` or `undefined`. You can still pass a
`Uint8Array` or `ArrayBuffer` directly to `registerFont`, `image` and `file`, and
you can pass a data URL directly to `image` and `file`. An unregistered file path
throws in the browser. The optional `birthtime` and `ctime` values must be valid
`Date` objects; either omitted value defaults to the time of registration.

## Documentation

For complete API documentation and more examples, see the [PDFKit website](http://pdfkit.org/).

## License

PDFKit is available under the MIT license.
