const FIELD_FLAGS = {
  readOnly: 1,
  required: 2,
  noExport: 4,
  multiline: 0x1000,
  password: 0x2000,
  toggleToOffButton: 0x4000,
  radioButton: 0x8000,
  pushButton: 0x10000,
  combo: 0x20000,
  edit: 0x40000,
  sort: 0x80000,
  multiSelect: 0x200000,
  noSpell: 0x400000,
};
const FIELD_JUSTIFY = {
  left: 0,
  center: 1,
  right: 2,
};
const VALUE_MAP = { value: 'V', defaultValue: 'DV' };
const FORMAT_SPECIAL = {
  zip: '0',
  zipPlus4: '1',
  zip4: '1',
  phone: '2',
  ssn: '3',
};
const FORMAT_DEFAULT = {
  number: {
    nDec: 0,
    sepComma: false,
    negStyle: 'MinusBlack',
    currency: '',
    currencyPrepend: true,
  },
  percent: {
    nDec: 0,
    sepComma: false,
  },
};

function mapTypeAndFlags(type, userOptions, pdfObject) {
  let flags = userOptions.Ff ?? 0;

  if (type === 'text') {
    pdfObject.FT = 'Tx';
  } else if (type === 'pushButton') {
    pdfObject.FT = 'Btn';
    flags |= FIELD_FLAGS.pushButton;
  } else if (type === 'radioButton') {
    pdfObject.FT = 'Btn';
    flags |= FIELD_FLAGS.radioButton;
  } else if (type === 'checkbox') {
    pdfObject.FT = 'Btn';
  } else if (type === 'combo') {
    pdfObject.FT = 'Ch';
    flags |= FIELD_FLAGS.combo;
  } else if (type === 'list') {
    pdfObject.FT = 'Ch';
  } else if (type) {
    throw new Error(`Invalid form annotation type '${type}'`);
  }

  Object.keys(userOptions).forEach((key) => {
    if (FIELD_FLAGS[key] && userOptions[key]) {
      flags |= FIELD_FLAGS[key];
    }
  });

  if (flags !== 0) {
    pdfObject.Ff = flags;
  }
}

// The Widget annotation's own visibility/print flags (PDF spec Table 168),
// distinct from the field's `Ff` flags mapTypeAndFlags() handles above.
// formAnnotation() defaults this to 4 (print only) when left unset.
function mapVisibility(options, pdfObject) {
  if (options.hidden) {
    // Hidden (2) + Print (4): not shown or interactive until an action
    // reveals it (e.g. a sibling field's onClick), but still printable once
    // it is.
    pdfObject.F = 6;
  }
}

function mapJustify(userOptions, pdfObject) {
  const result = FIELD_JUSTIFY[userOptions.align];
  if (typeof result === 'number' && result !== 0) {
    pdfObject.Q = result;
  }
}

function mapStrings(options, pdfObject) {
  if (Array.isArray(options.select) && options.select.length) {
    pdfObject.Opt = options.select.map((s) => {
      if (typeof s === 'string') {
        return new String(s);
      }
      return s;
    });
  }

  Object.keys(VALUE_MAP).forEach((key) => {
    if (key in options) {
      const value = options[key] ?? '';
      pdfObject[VALUE_MAP[key]] =
        typeof value === 'string' ? new String(value) : value;
    }
  });

  if (options.MK?.CA) {
    pdfObject.MK = { CA: new String(options.MK.CA) };
  }

  if (options.label) {
    pdfObject.MK = options.MK ?? {};
    pdfObject.MK.CA = new String(options.label);
  }
}

// Additional-action options, mapped to the entries of the widget annotation's
// /AA dictionary (PDF 32000-1 table 197) that a field can respond to. Each
// option takes the JavaScript to run when that event occurs.
const ANNOTATION_ACTIONS = {
  onClick: 'U', // the mouse button is released inside the field
  onMouseDown: 'D', // the mouse button is pressed inside the field
  onMouseEnter: 'E', // the cursor enters the field's active area
  onMouseExit: 'X', // the cursor leaves it
  onFocus: 'Fo', // the field receives the input focus
  onBlur: 'Bl', // the field loses it
};

function mapActions(options, pdfObject) {
  for (const [option, key] of Object.entries(ANNOTATION_ACTIONS)) {
    const action = options[option];
    if (!action) {
      continue;
    }
    // A function is stringified into the action and called with `this` bound
    // to the document, the same binding a viewer gives any field action. The
    // action runs in the viewer's own JavaScript engine, so it cannot close
    // over anything from the program that generated the document; write it as
    // a plain function rather than an arrow function, which cannot take that
    // binding.
    const js =
      typeof action === 'function' ? `(${action}).call(this);` : action;
    pdfObject.AA = pdfObject.AA ?? {};
    pdfObject.AA[key] = {
      S: 'JavaScript',
      JS: new String(js),
    };
  }
}

function mapFormat(options, pdfObject) {
  const f = options.format;
  if (f?.type) {
    let fnKeystroke;
    let fnFormat;
    let params = '';
    if (FORMAT_SPECIAL[f.type] !== undefined) {
      fnKeystroke = `AFSpecial_Keystroke`;
      fnFormat = `AFSpecial_Format`;
      params = FORMAT_SPECIAL[f.type];
    } else {
      let format = f.type.charAt(0).toUpperCase() + f.type.slice(1);
      fnKeystroke = `AF${format}_Keystroke`;
      fnFormat = `AF${format}_Format`;

      if (f.type === 'date') {
        // the Ex variants take the format as a string, where the plain ones
        // take an index into Acrobat's predefined formats
        fnKeystroke += 'Ex';
        fnFormat += 'Ex';
        params = '"' + String(f.param) + '"';
      } else if (f.type === 'time') {
        params = String(f.param);
      } else if (f.type === 'number') {
        let p = Object.assign({}, FORMAT_DEFAULT.number, f);
        params = String(
          [
            String(p.nDec),
            p.sepComma ? '0' : '1',
            '"' + p.negStyle + '"',
            'null',
            '"' + p.currency + '"',
            String(p.currencyPrepend),
          ].join(','),
        );
      } else if (f.type === 'percent') {
        let p = Object.assign({}, FORMAT_DEFAULT.percent, f);
        params = String([String(p.nDec), p.sepComma ? '0' : '1'].join(','));
      }
    }
    pdfObject.AA = options.AA ?? {};
    pdfObject.AA.K = {
      S: 'JavaScript',
      JS: new String(`${fnKeystroke}(${params});`),
    };
    pdfObject.AA.F = {
      S: 'JavaScript',
      JS: new String(`${fnFormat}(${params});`),
    };
  }
}

// The font reference to use in the /DR and /DA resources of a form or a
// field.
//
// `NeedAppearances` asks the reader to regenerate a field's appearance from
// its plain-text value, which it can only do with a font it can resolve that
// text against on its own. The font pdfkit embeds for its own content streams
// is subsetted and addressed by glyph id, so a reader given only that falls
// back to a substitute font for the field (see #1096). An embedded font can
// provide a complete, text-addressable embedding instead, at the cost of a
// second copy of the font program in the file -- so this is only used when
// `initForm` was asked for it. Standard fonts need nothing of the sort, and
// have no `completeRef`.
function formFontRef(doc, font) {
  return doc._acroform.embedFonts && typeof font.completeRef === 'function'
    ? font.completeRef()
    : font.ref();
}

export default {
  /**
   * Must call if adding AcroForms to a document. Must also call font() before
   * this method to set the default font.
   */
  initForm(options = {}) {
    if (!this._font) {
      throw new Error('Must set a font before calling initForm method');
    }
    this._acroform = {
      fonts: {},
      defaultFont: this._font.name,
      embedFonts: options.embedFonts === true,
    };
    this._acroform.fonts[this._font.id] = formFontRef(this, this._font);

    let data = {
      Fields: [],
      NeedAppearances: true,
      DA: new String(`/${this._font.id} 0 Tf 0 g`),
      DR: {
        Font: {},
      },
    };
    data.DR.Font[this._font.id] = formFontRef(this, this._font);
    const AcroForm = this.ref(data);
    this._root.data.AcroForm = AcroForm;
    return this;
  },

  /**
   * Called automatically by document.js
   */
  endAcroForm() {
    if (this._root.data.AcroForm) {
      if (
        !Object.keys(this._acroform.fonts).length &&
        !this._acroform.defaultFont
      ) {
        throw new Error('No fonts specified for PDF form');
      }
      let fontDict = this._root.data.AcroForm.data.DR.Font;
      Object.keys(this._acroform.fonts).forEach((name) => {
        fontDict[name] = this._acroform.fonts[name];
      });
      this._root.data.AcroForm.data.Fields.forEach((fieldRef) => {
        this._endChild(fieldRef);
      });
      this._root.data.AcroForm.end();
    }
    return this;
  },

  _endChild(ref) {
    if (Array.isArray(ref.data.Kids)) {
      ref.data.Kids.forEach((childRef) => {
        this._endChild(childRef);
      });
      ref.end();
    }
    return this;
  },

  /**
   * Creates and adds a form field to the document. Form fields are intermediate
   * nodes in a PDF form that are used to specify form name heirarchy and form
   * value defaults.
   * @param {string} name - field name (T attribute in field dictionary)
   * @param {object} options  - other attributes to include in field dictionary
   */
  formField(name, options = {}) {
    let fieldDict = this._fieldDict(name, null, options);
    let fieldRef = this.ref(fieldDict);
    this._addToParent(fieldRef);
    return fieldRef;
  },

  /**
   * Creates and adds a Form Annotation to the document. Form annotations are
   * called Widget annotations internally within a PDF file.
   * @param {string} name - form field name (T attribute of widget annotation
   * dictionary)
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {object} options
   */
  formAnnotation(name, type, x, y, w, h, options = {}) {
    let fieldDict = this._fieldDict(name, type, options);
    fieldDict.Subtype = 'Widget';
    if (fieldDict.F === undefined) {
      fieldDict.F = 4; // print the annotation
    }

    // Add Field annot to page, and get it's ref
    this.annotate(x, y, w, h, fieldDict);
    let annotRef = this.page.annotations[this.page.annotations.length - 1];

    return this._addToParent(annotRef);
  },

  formText(name, x, y, w, h, options = {}) {
    return this.formAnnotation(name, 'text', x, y, w, h, options);
  },

  formPushButton(name, x, y, w, h, options = {}) {
    return this.formAnnotation(name, 'pushButton', x, y, w, h, options);
  },

  formCombo(name, x, y, w, h, options = {}) {
    return this.formAnnotation(name, 'combo', x, y, w, h, options);
  },

  formList(name, x, y, w, h, options = {}) {
    return this.formAnnotation(name, 'list', x, y, w, h, options);
  },

  formRadioButton(name, x, y, w, h, options = {}) {
    return this.formAnnotation(name, 'radioButton', x, y, w, h, options);
  },

  formCheckbox(name, x, y, w, h, options = {}) {
    return this.formAnnotation(name, 'checkbox', x, y, w, h, options);
  },

  _addToParent(fieldRef) {
    let parent = fieldRef.data.Parent;
    if (parent) {
      if (!parent.data.Kids) {
        parent.data.Kids = [];
      }
      parent.data.Kids.push(fieldRef);
    } else {
      this._root.data.AcroForm.data.Fields.push(fieldRef);
    }
    return this;
  },

  _fieldDict(name, type, options = {}) {
    if (!this._acroform) {
      throw new Error(
        'Call document.initForm() method before adding form elements to document',
      );
    }
    const pdfObject = {};

    mapTypeAndFlags(type, options, pdfObject);
    mapVisibility(options, pdfObject);
    mapJustify(options, pdfObject);
    this._mapFont(options, pdfObject);
    mapStrings(options, pdfObject);
    this._mapColors(options, pdfObject);
    mapFormat(options, pdfObject);
    mapActions(options, pdfObject);

    pdfObject.T = new String(name);

    if (options.parent) {
      pdfObject.Parent = options.parent;
    }
    return pdfObject;
  },

  _mapColors(options, pdfObject) {
    let color = this._normalizeColor(options.backgroundColor);
    if (color) {
      pdfObject.MK = pdfObject.MK ? pdfObject.MK : {};
      pdfObject.MK.BG = color;
    }

    color = this._normalizeColor(options.borderColor);
    if (color) {
      if (!pdfObject.MK) {
        pdfObject.MK = {};
      }
      pdfObject.MK.BC = color;
    }
  },

  _mapFont(options, pdfObject) {
    const { _acroform, _font } = this;
    // add current font to document-level AcroForm dict if necessary
    if (_acroform.fonts[_font.id] == null) {
      _acroform.fonts[_font.id] = formFontRef(this, _font);
    }

    // add current font to field's resource dict (RD) if not the default acroform font
    if (_acroform.defaultFont !== _font.name) {
      pdfObject.DR = { Font: {} };

      // Get the fontSize option. If not set use auto sizing
      const fontSize = options.fontSize || 0;

      pdfObject.DR.Font[_font.id] = formFontRef(this, _font);
      pdfObject.DA = new String(`/${_font.id} ${fontSize} Tf 0 g`);
    }
  },
};
