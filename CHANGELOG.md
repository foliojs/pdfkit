## pdfkit changelog

### Unreleased

### [v0.13.0] - 2021-10-24

- Add tiling pattern support

### [v0.12.3] - 2021-08-01

- Remove examples from published package

### [v0.12.2] - 2021-08-01

- Fix for PDF accessibility check. (#1265)
- Allow applying 'underline' and 'strike' text styling together on a text
- Allow to specify the AcroForm text fontSize
- Update crypto-js to v4.0 (properly fix security issue)

### [v0.12.1] - 2021-04-10

- Update crypto-js to v3.3 (fix security issue)
- Update fontkit to 1.8.1

### [v0.12.0] - 2021-04-04

- Add support for Embedded Files and File Attachment Annotations
- Accessibility support
- Replace integration tests by visual regression tests
- Fix access permissions in PDF version 1.7ext3
- Fix Buffer() is deprecation warning
- Add `forms.md` to generate documentation files
- Fix "@" in FontName

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

### [v0.9.0] - 2019-01-28

- Convert to code base from coffescript to ES6+
- Fix loading grayscale / transparent PNG files
- Reduce number of calls to async functions
- Implement encryption / access control
