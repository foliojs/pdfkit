## pdfkit changelog

### Unreleased

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
