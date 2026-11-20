# PDFKit Playground

A browser-based PDFKit playground with a CodeMirror 6 JavaScript editor and a
live PDF preview.

## Development

From the repository root:

```sh
yarn playground:dev
```

The command builds PDFKit before starting the Vite development server.

## Production build

```sh
yarn playground:build
```

Vite writes the production site to `examples/playground/dist/`. Build assets use
relative paths so the output can be hosted below a nested URL. To serve the
production build locally, run:

```sh
yarn playground:preview
```

## How it works

The editor supplies an asynchronous function with `PDFDocument`, `toBlob`, and
`lorem` bindings. The initial example demonstrates text, vector graphics, SVG
paths, gradients, patterns, and multicolumn text. The edited source is saved
under the `editorText` local-storage key and runs after a short debounce.

Editable code must return a PDF `Blob`. A successful Blob is displayed in the
preview iframe; failures are shown in the page while the last successful PDF
remains visible.

The JavaScript executes directly in the browser page context. It is not
sandboxed, so this playground is intended for trusted, self-authored code.
