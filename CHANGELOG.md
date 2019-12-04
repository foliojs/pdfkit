## pdfkit changelog

### Unreleased

### [v0.11.0] - 2019-12-03

- Fix infinite loop when an individual character is bigger than the width of the text.
- Fix infinite loop when text is positioned after page right margin
- Allow links in continued text to be stopped by setting link to null
- Add support to interlaced PNG files
- Do not emit \_interopDefault helper in commonjs build
- Fix gradient with multiple stops (#1045)
- Set link annotation flag to print by default
- Add support for AcroForms
- Drop support for (uncommon) cid less fonts on standalone build (reduces bundle size)

### [v0.10.0] - 2019-06-06

- Fix links to pages within the document
- Add support for named destinations
- Throw errors when `dash(...)` is passed invalid lengths
- Remove PDFDocument#output method
- Add standalone build (js/pdfkit.standalone.js)

### [v0.9.1] - 2019-04-30

- Fix setting printing permission
- Fix corruption of string objects in browser
- Add option to set default font
- Remove call to fontkit.openSync
- Add standalone virtual file system implementation
- Add option (fontLayoutCache) to disable font layout cache

### [v0.9.0] - 2019-1-28

- Convert to code base from coffescript to ES6+
- Fix loading grayscale / transparent PNG files
- Reduce number of calls to async functions
- Implement encryption / access control
