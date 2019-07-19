// import PDFOutline from '../outline';

const FIELD_FLAGS = {
  readyOnly: 1,
  required: 2,
  noExport: 4,
  multiline: 0x1000,
  password: 0x2000,
  toggleToOffButton: 0x4000,
  radioButton: 0x8000,
  pushButton: 0x10000,
  combo: 0x20000,
  edit: 0x40000,
  sort: 0x80000
};
const FIELD_JUSTIFY = {
  left: 0,
  center: 1,
  right: 2
};

export default {

  /**
   * Must call if adding AcroForms to a document. Must call font() before this
   * method to set the default font.
   */
  initAcroForm () {
    this._acroform = {
      fonts: {}
    };

    let data = {
      Fields: [],
      NeedsAppearances: true,
      DA: new String(`/${this._font.id} 0 Tf 0 g`),
      DR: {
        Font: {}
      }
    };
    data.DR.Font[this._font.id] = this._font.ref();
    const AcroForm = this.ref(data);
    this._root.data.AcroForm = AcroForm;
    return this;
  },

  endAcroForm () {
    if (this._root.data.AcroForm) {
      if (!Object.keys(this._acroform.fonts).length) {
        throw new Error('No fonts specified for AcroForm Fields');
      }
      let fontDict = this._root.data.AcroForm.data.DR.Font
      Object.keys(this._acroform.fonts).forEach(name => {
        fontDict[name] = this._acroform.fonts[name]
      });
      // if (this._acroform.defaultFont) {
      //   let font = this._fontFamiles[this._acroform.defaultFont];
      //   this._root.data.AcroForm.data.DA = new String(`/${font.id} 0 Tf 0 g`)
      // }
      this._root.data.AcroForm.end();
    }
    return this;
  },

  formAnnot (name, x, y, w, h, options = {}) {
    if (!this._acroform) {
      throw new Error('Call document.initAcroForm() method before adding AcroForm Fields to document');
    }
    let opts = Object.assign({}, options);
    opts = this._resolveFlags(opts);
    opts = this._resolveJustify(opts);
    opts = this._resolveFont(opts);
    opts = this._resolveStrings(opts);
    opts = Object.assign(opts, {
      Subtype: 'Widget',
      F: 4,
      FT: options.FT,
      T: new String(name),
      Ff: opts.Ff
    });
    // Add Field annot to page
    this.annotate(x, y, w, h, opts);

    // Hack to get annotRef back so we can add it to global fields array. The
    // annotation is the last one pushed on the page list
    let annotRef = this.page.annotations[this.page.annotations.length - 1];
    this._root.data.AcroForm.data.Fields.push(annotRef);
    return this;
  },

  _resolveFlags (options) {
    options.Ff = options.Ff ? options.Ff : 0;
    Object.keys(options).forEach(key => {
      if (FIELD_FLAGS[key]) {
        options.Ff |= FIELD_FLAGS[key]
        delete options[key]
      }
    });
    return options;
  },

  _resolveJustify (options) {
    if (options.align && FIELD_JUSTIFY[options.align]) {
      options.Q = FIELD_JUSTIFY[options.align];
      delete options.align;
    }
    return options;
  },

  _resolveFont (options) {
    // add current font to document-level AcroForm dict if necessary
    if (this._acroform.fonts[this._font.id] == null) {
      this._acroform.fonts[this._font.id] = this._font.ref();
    }

    // add current font to field's resource dict (RD) if not the default acroform font
    if (this._acroform.defaultFont !== this._font.name) {
      options.DR = { Font: {} };
      options.DR.Font[this._font.id] = this._font.ref();
    }
    return options;
  },

  _resolveStrings (options) {
    if (Array.isArray(options.Opt)) {
      let arr = [];
      for (let idx = 0; idx < options.Opt.length; idx++) {
        if (typeof options.Opt[idx] === 'string') {
          arr.push(new String(options.Opt[idx]))
        } else {
          arr.push(options.Opt[idx])
        }
        arr.push(new String(options.Opt[idx]));
      }
      options.Opt = arr;
    }
    ['V', 'DV'].forEach(key => {
      if (typeof options[key] === 'string') {
        options[key] = new String(options[key]);
      }
    });
    return options;
  },

  formButton (name, x, y, w, h, options = {}) {
    options.FT = 'Btn';
    return this.formAnnot(name, x, y, w, h, options)
  },

  formPushButton (name, x, y, w, h, options = {}) {
    options.pushButton = true;
    return this.formButton(name, x, y, w, h, options)
  },

  formRadioButton (name, x, y, w, h, options = {}) {
    options.radioButton = true;
    return this.formButton(name, x, y, w, h, options)
  },

  formNoToggleToOffButton (name, x, y, w, h, options = {}) {
    options.toggleToOffButton = true;
    return this.formButton(name, x, y, w, h, options)
  },

  formText (name, x, y, w, h, options = {}) {
    options.FT = 'Tx'
    return this.formAnnot(name, x, y, w, h, options)
  },

  formChoice (name, x, y, w, h, options = {}) {
    options.FT = 'Ch'
    return this.formAnnot(name, x, y, w, h, options)
  },


};
