# Forms in PDFKit

Forms are interactive features of the PDF format. They make it possible to
add annotations such as text fields, combo boxes, buttons and actions. To
include Forms in the PDF that you are generating you must call the document
`initForms()` method.

- `initForms()` - Must be called before adding any forms or fields to the
  document.

```javascript
doc.font('Helvetica'); // establishes the default form field font
doc.initForms();
```

## Forms Methods

Form elements are _Widget Annotations_ and are added using the document
`widgetAnnotation` method. Additional methods listed below are shortcut methods
that call the `widgetAnnotation` method. The list of the available _Widget
Annotation_ document methods is:

- `widgetAnnotation( name, x, y, width, height, options)`
- `formText( name, x, y, width, height, options)`
- `formPushButton( name, x, y, width, height, name, options)`
- `formRadioButton( name, x, y, width, height, options)`
- `formChoice( name, x, y, width, height, options)`

There is more information on `name` in the **Field Names** section below.

### Options Parameter

#### Common Options

Widget Annotation `options` that are common across all field types are:

- `required` [_boolean_] - The field must have a value by the time the form is submitted.
- `noExport` [_boolean_] - The field will not be exported if a form is submitted.
- `readyOnly` [_boolean_] - The user may not change the value of the field, and
  the field will not respond to mouse clicks. This is useful for fields that are
  computed.
- `value` [_number|string_] - The field's value
- `defaultValue` [_number|string_] - The default value to which the field
  reverts if a reset-form action is executed.

Some Widget Annotations have a `color` option that can be specified. You can use
an array of RGB values, a hex color, or a named CSS color value for that option.

- `backgroundColor` - field background color
- `borderColor` - field border color

#### Text Field Options

- `align` [_string_] - For text form fields, sets the alignment to `left`,
  `center` or `right`.
- `multiline` [_boolean_] - For text fields, allows the field to have multiple lines of text.
- `password` [_boolean_] - For text fields, the text will be masked (_e.g._ with asterisks)
- `noSpell` [_boolean_] - If set, text entered in the field is not spell-checked
- `format` [_object_] - See the section on **Text Field Formatting** below.

```js
doc.formText('leaf2', 10, 60, 200, 40, {
  multiline: true,
  align: 'right',
  format: {
    type: 'date',
    params: 'm/d'
  }
});
```

#### Choice Field Options

- `combo` [_boolean_] - If set, the field is a combo box, otherwise it is a list box.
- `edit` [_boolean_] - For combo boxes, allows for the user to enter a value in the field.
- `sort` [_boolean_] - The field options will be sorted alphabetically.
- `noSpell` [_boolean_] - If set, text entered in the field is not spell-checked
- `choices` [_array_] - Array of choices

```js
opts = {
  choices: ['', 'github', 'bitbucket', 'gitlab'],
  value: '',
  defaultValue: '',
  align: 'left',
  combo: true
};
doc.formChoice('ch1', 10, y, 100, 20, opts);
```

#### Button Field Options

- `label` [_string_] - For buttons, sets the label text.
- `pushButton` [_boolean_] - If set, the field is a pushbutton that does not
  retain a permanent value.
- `radioButton` [_boolean_] - If set, the field is a set of radio buttons; if
  clear, the field is a checkbox. This flag is meaningful only if the Pushbutton
  flag is clear.
- `toggleToOffButton` [_boolean_] - For Radio Buttons, if set, then exactly one radio
  button will be selected at one time.

```js
var opts = {
  backgroundColor: 'yellow',
  label: 'Test Button'
};
doc.formPushButton('btn1', 10, 200, 100, 30, opts);
```

### Text Field Formatting

When needing to format the text value of a Widget Annotation, the following
`options` are available to implement predefined document JavaScript actions that
will automatically format the text. Refer to the section on **Formatting
scripts** in the Acrobat SDK documentation for the [Acrobat Forms
Plugin](https://help.adobe.com/en_US/acrobat/acrobat_dc_sdk/2015/HTMLHelp/#t=Acro12_MasterBook%2FIAC_API_FormsIntro%2FMethods1.htm)
for more information.

Add a format dictionary to `options`. The dictionary will contain a type and optional additional formatting.

- `format` - generic object
- `format.type` - value must be one of `date`, `time`, `percent`, `number`, `zip`, `zipPlus4`, `phone` or `ssn`.

The types `date`, `time`, `percent` and `number` have additional formatting.

#### Date format

- `format.param` - value must be one of the strings `m/d`, `m/d/yy`,
  `mm/dd/yy`, `mm/yy`, `d-mmm`, `d-mmm-yy`, `dd-mmm-yy`, `yy-mm-dd`,
  `mmm-yy`, `mmmm-yy`, `mmm d, yyyy`, `mmmm d, yyyy`, `m/d/yy h:MM tt`, or
  `m/d/yy HH:MM`.

```js
// Date text field formatting
doc.formText('field.date', 10, 60, 200, 40, {
  align: 'center',
  format: {
    type: 'date',
    param: 'mmmm d, yyyy'
  }
});
```

#### Time format

- `format.param` - value must be a number between 0 and 3, representing
  the formats "14:30", "2:30 PM", "14:30:15" and "2:30:15 PM".

```js
// Time text field formatting
doc.formText('field.time', 10, 60, 200, 40, {
  align: 'center',
  format: {
    type: 'time',
    param: 2
  }
});
```

#### Number and percent format

- `format.nDec` [_number_] - the number of places after the decimal point
- `format.sepComma` [_boolean_] - display a comma separator
- `format.negStyle` [_string_] (`number` only) - the value must be one of `MinusBlack` , `Red`, `ParensBlack`, `ParensRed`
- `format.currency` [_string_] (`number` only) - the currency symbol
- `format.currencyPrepend` [_boolean_] (`number` only) - set to true to prepend the currency symbol

```js
// Currency text field formatting
doc.formText('leaf2', 10, 60, 200, 40, {
  multiline: true,
  align: 'right',
  format: {
    type: 'number',
    nDec: 2,
    sepComma: true,
    negStyle: 'ParensRed',
    currency: '$',
    currencPrepend: true
  }
});
```

### Advanced Form Field Use

Forms can be quite complicated and your needs will likely grow to sometimes need
to directly specify the attributes that will go into the Widget Annotation or
Field dictionaries. Consult the **PDF Reference** and set these attributes in
the `options` object. Any options that are not listed above will be added
directly to the corresponding PDF Object.

## Other Methods

The font used for a Widget Annotation is set using the `document.font` method.
Yes that's the same method as is used when setting the text font.

In support of Widget Annotations that execute JavaScript in PDF, you can use the
following document method:

- `addNamedJavaScript( name, buffer )`

## Field Names

Widget Annotations are, by default, added to the Catalog's `Form` dictionary
as an array of `Fields`. Fields are organized in a name heirarchy, for example
_shipping.address.street_. You can either set the `name` of each Widget
Annotation with the full name (e.g. _shipping.address.street_) or you can create
parent Fields. In this example you might have a _shipping_ field that is added
to the Form Fields array, an _address_ field that refers to the _shipping_
Field as it's parent, and a _street_ Widget Annotation that would refer to the
_address_ field as it's parent. To create a field use the document method:

- `field( name, options )` - returns a reference to the field

To specify the parent of a _Field_ or _Widget Annotation_, set the `parent`
options to the field reference.

Example PDF using field hierarchy, three text fields and a push
button.

```javascript
doc.font('Helvetica'); // establishes the default font
doc.initForms();

let rootField = doc.field('rootField');
let child1Field = doc.field('child1Field', { Parent: rootField });
let child2Field = doc.field('child2Field', { Parent: rootField });
doc.formText('leaf1', 10, 10, 200, 40, {
  Parent: child1Field,
  multiline: true
});
doc.formText('leaf2', 10, 60, 200, 40, {
  Parent: child1Field,
  multiline: true
});
doc.formText('leaf3', 10, 110, 200, 80, {
  Parent: child2Field,
  multiline: true
});

var opts = {
  backgroundColor: 'yellow',
  label: 'Test Button'
};
doc.formPushButton('btn1', 10, 200, 100, 30, opts);
```

The output of this example looks like this.

![0](images/Forms.png)

## Limitations

### Form Field Appearances

Form elements must each have an _appearance_ set using the `AP` attribute of the
annotation. If this attribute is not set, the form element's value _may_ not be
visible. Because appearances can be complex to generate, Adobe Acrobat has an
option to build these apperances from form values and Widget Annotation
attributes when a PDF is first opened. To do this PDFKit always sets the Form dictionary's
`NeedAppearances` attribute to true. This could mean that the PDF will be
_dirty_ upon open, meaning it will need to be saved.

It is important to note that the `NeedAppearances` flag may not be honored by
PDF viewers that do not implement this aspect of the PDF Reference.

Some form documents may not need to generate appearances. This may be the case
for text Widget Annotations that initially have no value. This is not true for
push button widget annotations.

### Document JavaScript

Many PDF Viewers, aside from Adobe Acrobat Reader, do not implement document
JavaScript. Even Adobe Readers may not implement document JavaScript where it is
not permitted by a device's app store terms of service (e.g. iOS devices). It is
recommended that you test your PDF form documents across all platforms and
viewers that you wish to support.

---
