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
  sort: 0x80000,
  noSpell: 0x400000
};
const FIELD_JUSTIFY = {
  left: 0,
  center: 1,
  right: 2
};
const FORMAT_SPECIAL = {
  zip: '0',
  zipPlus4: '1',
  zip4: '1',
  phone: '2',
  ssn: '3'
};
const FORMAT_DEFAULT = {
  number: {
    nDec: 0,
    sepComma: false,
    negStyle: 'MinusBlack',
    currency: '$',
    currencyPrepend: true
  },
  percent: {
    nDec: 0,
    sepComma: false
  }
};

export default {
  /**
   * Must call if adding AcroForms to a document. Must also call font() before
   * this method to set the default font.
   */
  initForms() {
    this._acroform = {
      fonts: {}
    };

    let data = {
      Fields: [],
      NeedAppearances: true,
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

  /**
   * Called automatically by document.js
   */
  endAcroForm() {
    if (this._root.data.AcroForm) {
      if (!Object.keys(this._acroform.fonts).length) {
        throw new Error('No fonts specified for AcroForm Fields');
      }
      let fontDict = this._root.data.AcroForm.data.DR.Font;
      Object.keys(this._acroform.fonts).forEach(name => {
        fontDict[name] = this._acroform.fonts[name];
      });
      this._root.data.AcroForm.data.Fields.forEach(fieldRef => {
        this._endChild(fieldRef);
      });
      this._root.data.AcroForm.end();
    }
    return this;
  },

  _endChild(ref) {
    if (Array.isArray(ref.data.Kids)) {
      ref.data.Kids.forEach(childRef => {
        this._endChild(childRef);
      });
      ref.end();
    }
    return this;
  },

  /**
   * Creates and adds a field to the document.
   * @param {string} name - field name (T attribute in field dictionary)
   * @param {object} options  - other attributes to include in field dictionary
   */
  field(name, options = {}) {
    let fieldDict = this._fieldDict(name, options);
    let fieldRef = this.ref(fieldDict);
    this._addToParent(fieldRef);
    return fieldRef;
  },

  /**
   * Creates and adds a Widget Annotation to the document. Widget annotations
   * are form fields.
   * @param {string} name - form field name (T attribute of widget annotation dictionary)
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {object} options
   */
  widgetAnnotation(name, x, y, w, h, options = {}) {
    let fieldDict = this._fieldDict(name, options);
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
    options.FT = 'Tx';
    return this.widgetAnnotation(name, x, y, w, h, options);
  },

  formButton(name, x, y, w, h, options = {}) {
    options.FT = 'Btn';
    return this.widgetAnnotation(name, x, y, w, h, options);
  },

  formPushButton(name, x, y, w, h, options = {}) {
    options.pushButton = true;
    return this.formButton(name, x, y, w, h, options);
  },

  formRadioButton(name, x, y, w, h, options = {}) {
    options.radioButton = true;
    return this.formButton(name, x, y, w, h, options);
  },

  // formNoToggleToOffButton(name, x, y, w, h, options = {}) {
  //   options.toggleToOffButton = true;
  //   return this.formButton(name, x, y, w, h, options);
  // },

  formChoice(name, x, y, w, h, options = {}) {
    options.FT = 'Ch';
    return this.widgetAnnotation(name, x, y, w, h, options);
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

  _fieldDict(name, options = {}) {
    if (!this._acroform) {
      throw new Error(
        'Call document.initForms() method before adding AcroForm Fields to document'
      );
    }
    let opts = Object.assign({}, options);
    opts = this._resolveFlags(opts);
    opts = this._resolveJustify(opts);
    opts = this._resolveFont(opts);
    opts = this._resolveStrings(opts);
    opts = this._resolveColors(opts);
    opts = this._resolveFormat(opts);
    opts = Object.assign(opts, {
      T: new String(name)
    });
    return opts;
  },

  _resolveFormat(opts) {
    const f = opts.format;
    if (f && f.type) {
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
          fnKeystroke += 'Ex';
          params = String(f.param);
        } else if (f.type === 'time') {
          params = String(f.param);
        } else if (f.type === 'number') {
          let p = Object.assign({}, FORMAT_DEFAULT.number, f);
          params = String(
            [
              String(p.nDec),
              p.sepComma ? '0' : '1',
              p.negStyle,
              'null',
              p.currency,
              String(p.currencyPrepend)
            ].join(',')
          );
        } else if (f.type === 'percent') {
          let p = Object.assign({}, FORMAT_DEFAULT.percent, f);
          params = String([String(p.nDec), p.sepComma ? '0' : '1'].join(','));
        }
      }
      opts.AA = opts.AA ? opts.AA : {};
      opts.AA.K = {
        S: 'JavaScript',
        JS: new String(`${fnKeystroke}(${params});`)
      };
      opts.AA.F = {
        S: 'JavaScript',
        JS: new String(`${fnFormat}(${params});`)
      };
    }
    delete opts.format;
    return opts;
  },

  _formatParamsAsString(params) {
    if (Array.isArray(params)) {
      return JSON.stringify(params)
        .replace('[', '')
        .replace(']', '');
    }
    return String(params);
  },

  _resolveColors(opts) {
    let color = this._normalizeColor(opts.backgroundColor);
    if (color) {
      if (!opts.MK) {
        opts.MK = {};
      }
      opts.MK.BG = color;
    }
    color = this._normalizeColor(opts.borderColor);
    if (color) {
      if (!opts.MK) {
        opts.MK = {};
      }
      opts.MK.BC = color;
    }
    delete opts.backgroundColor;
    delete opts.borderColor;
    return opts;
  },

  _resolveFlags(options) {
    let result = 0;
    Object.keys(options).forEach(key => {
      if (FIELD_FLAGS[key]) {
        result |= FIELD_FLAGS[key];
        delete options[key];
      }
    });
    if (result !== 0) {
      options.Ff = options.Ff ? options.Ff : 0;
      options.Ff |= result;
    }
    return options;
  },

  _resolveJustify(options) {
    let result = 0;
    if (options.align !== undefined) {
      if (typeof FIELD_JUSTIFY[options.align] === 'number') {
        result = FIELD_JUSTIFY[options.align];
      }
      delete options.align;
    }
    if (result !== 0) {
      options.Q = result; // default
    }
    return options;
  },

  _resolveFont(options) {
    // add current font to document-level AcroForm dict if necessary
    if (this._acroform.fonts[this._font.id] === null) {
      this._acroform.fonts[this._font.id] = this._font.ref();
    }

    // add current font to field's resource dict (RD) if not the default acroform font
    if (this._acroform.defaultFont !== this._font.name) {
      options.DR = { Font: {} };
      options.DR.Font[this._font.id] = this._font.ref();
    }
    return options;
  },

  _resolveStrings(options) {
    let choices = [];
    function appendChoices(a) {
      if (Array.isArray(a)) {
        for (let idx = 0; idx < a.length; idx++) {
          if (typeof a[idx] === 'string') {
            choices.push(new String(a[idx]));
          } else {
            choices.push(a[idx]);
          }
        }
      }
    }

    appendChoices(options.Opt);
    appendChoices(options.choices);
    if (choices.length) {
      options.Opt = choices;
    }

    ['V', 'DV'].forEach(key => {
      if (typeof options[key] === 'string') {
        options[key] = new String(options[key]);
      }
    });
    if (typeof options.value === 'string') {
      options.V = new String(options.value);
    } else if (typeof options.value === 'number') {
      options.V = options.value;
    }
    if (typeof options.defaultValue === 'string') {
      options.DV = new String(options.defaultValue);
    } else if (typeof options.defaultValue === 'number') {
      options.DV = options.defaultValue;
    }

    if (options.MK && options.MK.CA) {
      options.MK.CA = new String(options.MK.CA);
    }
    if (options.label) {
      options.MK = options.MK ? options.MK : {};
      options.MK.CA = new String(options.label);
      delete options.label;
    }
    return options;
  }
};
