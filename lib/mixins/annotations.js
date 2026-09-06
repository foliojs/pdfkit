import PDFAnnotationReference from '../structure_annotation';

export default {
  annotate(x, y, w, h, options) {
    const { structParent, color, ...annotations } = options;
    annotations.Type = 'Annot';
    annotations.Rect = this._convertRect(x, y, w, h);
    annotations.Border = [0, 0, 0];

    if (
      annotations.Subtype === 'Link' &&
      typeof annotations.F === 'undefined'
    ) {
      annotations.F = 1 << 2; // Print Annotation Flag
    }

    if (annotations.Subtype !== 'Link') {
      if (annotations.C == null) {
        annotations.C = this._normalizeColor(color || [0, 0, 0]);
      }
    }

    if (typeof annotations.Dest === 'string') {
      annotations.Dest = new String(annotations.Dest);
    }

    const ref = this.ref(annotations);
    this.page.annotations.push(ref);

    if (typeof structParent?.add === 'function') {
      const annotRef = new PDFAnnotationReference(ref);
      structParent.add(annotRef);
    }

    ref.end();
    return this;
  },

  note(x, y, w, h, contents, options) {
    const annotationOptions = {
      ...options,
      Subtype: 'Text',
      Contents: new String(contents),
    };
    if (annotationOptions.Name == null) {
      annotationOptions.Name = 'Comment';
    }
    if (annotationOptions.color == null) {
      annotationOptions.color = [243, 223, 92];
    }

    return this.annotate(x, y, w, h, annotationOptions);
  },

  goTo(x, y, w, h, name, options) {
    const annotateOptions = {
      ...options,
      Subtype: 'Link',
      A: this.ref({ S: 'GoTo', D: new String(name) }),
    };
    annotateOptions.A.end();
    return this.annotate(x, y, w, h, annotateOptions);
  },

  link(x, y, w, h, url, options) {
    const annotateOptions = { ...options, Subtype: 'Link' };

    if (typeof url === 'number') {
      // Link to a page in the document (the page must already exist)
      const pages = this._root.data.Pages.data;
      if (url >= 0 && url < pages.Kids.length) {
        annotateOptions.A = this.ref({
          S: 'GoTo',
          D: [pages.Kids[url], 'XYZ', null, null, null],
        });
        annotateOptions.A.end();
      } else {
        throw new Error(`The document has no page ${url}`);
      }
    } else {
      // Link to an external url
      annotateOptions.A = this.ref({
        S: 'URI',
        URI: new String(url),
      });
      annotateOptions.A.end();
    }

    if (annotateOptions.structParent && !annotateOptions.Contents) {
      annotateOptions.Contents = new String('');
    }

    return this.annotate(x, y, w, h, annotateOptions);
  },

  _markup(x, y, w, h, options) {
    const [x1, y1, x2, y2] = this._convertRect(x, y, w, h);
    return this.annotate(x, y, w, h, {
      ...options,
      QuadPoints: [x1, y2, x2, y2, x1, y1, x2, y1],
      Contents: new String(),
    });
  },

  highlight(x, y, w, h, options) {
    const annotationOptions = { ...options, Subtype: 'Highlight' };
    if (annotationOptions.color == null) {
      annotationOptions.color = [241, 238, 148];
    }
    return this._markup(x, y, w, h, annotationOptions);
  },

  underline(x, y, w, h, options) {
    const annotationOptions = { ...options, Subtype: 'Underline' };
    return this._markup(x, y, w, h, annotationOptions);
  },

  strike(x, y, w, h, options) {
    const annotationOptions = { ...options, Subtype: 'StrikeOut' };
    return this._markup(x, y, w, h, annotationOptions);
  },

  lineAnnotation(x1, y1, x2, y2, options) {
    const annotationOptions = {
      ...options,
      Subtype: 'Line',
      Contents: new String(),
      L: [x1, this.page.height - y1, x2, this.page.height - y2],
    };
    return this.annotate(x1, y1, x2, y2, annotationOptions);
  },

  rectAnnotation(x, y, w, h, options) {
    const annotationOptions = {
      ...options,
      Subtype: 'Square',
      Contents: new String(),
    };
    return this.annotate(x, y, w, h, annotationOptions);
  },

  ellipseAnnotation(x, y, w, h, options) {
    const annotationOptions = {
      ...options,
      Subtype: 'Circle',
      Contents: new String(),
    };
    return this.annotate(x, y, w, h, annotationOptions);
  },

  textAnnotation(x, y, w, h, text, options) {
    const annotationOptions = {
      ...options,
      Subtype: 'FreeText',
      Contents: new String(text),
      DA: new String(),
    };
    return this.annotate(x, y, w, h, annotationOptions);
  },

  fileAnnotation(x, y, w, h, file = {}, options) {
    // create hidden file
    const filespec = this.file(file.src, Object.assign({ hidden: true }, file));

    const annotationOptions = {
      ...options,
      Subtype: 'FileAttachment',
      FS: filespec,
    };

    // add description from filespec unless description (Contents) has already been set
    if (annotationOptions.Contents) {
      annotationOptions.Contents = new String(annotationOptions.Contents);
    } else if (filespec.data.Desc) {
      annotationOptions.Contents = new String(filespec.data.Desc);
    }

    return this.annotate(x, y, w, h, annotationOptions);
  },

  _convertRect(x1, y1, w, h) {
    // flip y1 and y2
    const y2 = y1;
    y1 += h;

    // make x2
    const x2 = x1 + w;

    // apply current transformation matrix to points
    const [m0, m1, m2, m3, m4, m5] = this._ctm;
    const transform = (x, y) => [m0 * x + m2 * y + m4, m1 * x + m3 * y + m5];

    // ISO 32000-1 12.5.2 defines Rect as an axis aligned rectangle in default
    // user space, so a rotated or skewed matrix needs the bounding box of all
    // four transformed corners. Two corners are enough only while the matrix
    // keeps the axes aligned, and picking the extremes also keeps the result
    // normalized ([llx lly urx ury], ISO 32000-1 7.9.5) when the matrix
    // mirrors an axis.
    const corners = [
      transform(x1, y1),
      transform(x2, y1),
      transform(x2, y2),
      transform(x1, y2),
    ];
    const xs = corners.map((corner) => corner[0]);
    const ys = corners.map((corner) => corner[1]);

    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  },
};
