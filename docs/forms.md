# Forms in PDFKit

Forms are an interactive feature of the PDF format. Forms make it possible to
add form annotations such as text fields, combo boxes, buttons and actions.
Before addings forms to a PDF you must call the document `initForm()` method.

- `initForm()` - Must be called before adding a form annotation to the document.

```javascript
doc.font('Helvetica'); // establishes the default form field font
doc.initForm();
```

## Form Annotation Methods

Form annotations are added using the following document methods.

- `formText( name, x, y, width, height, options)`
- `formPushButton( name, x, y, width, height, name, options)`
- `formCombo( name, x, y, width, height, options)`
- `formList( name, x, y, width, height, options)`

The above methods call the `formAnnotation` method with
type set to one of `text`, `pushButton`, `radioButton`, `combo` or `list`.

- `formAnnotation( name, type, x, y, width, height, options)`

### `name` Parameter

Form annotations are each given a `name` that is used for identification. Field
names are hierarchical using a period ('.') as a separaror (_e.g._
_shipping.address.street_). More than one form field can have the same name.
When this happens, the fields will have the same value. There is more
information on `name` in the **Field Names** section below.

### `options` Parameter

#### Common Options

Form Annotation `options` that are common across all form annotation types are:

- `required` [_boolean_] - The field must have a value by the time the form is submitted.
- `noExport` [_boolean_] - The field will not be exported if a form is submitted.
- `readOnly` [_boolean_] - The user may not change the value of the field, and
  the field will not respond to mouse clicks. This is useful for fields that have
  computed values.
- `value` [_number|string_] - The field's value.
- `defaultValue` [_number|string_] - The default value to which the field
  reverts if a reset-form action is executed.

Some form annotations have `color` options. You can use an array of RGB values,
a hex color, or a named CSS color value for that option.

- `backgroundColor` - field background color
- `borderColor` - field border color

#### Text Field Options

- `align` [_string_] - Sets the alignment to `left`,
  `center` or `right`.
- `multiline` [_boolean_] - Allows the field to have multiple lines of text.
- `password` [_boolean_] - The text will be masked (_e.g._ with asterisks).
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

#### Combo and List Field Options

- `sort` [_boolean_] - The field options will be sorted alphabetically.
- `edit` [_boolean_] - (combo only) Allow the user to enter a value in the field.
- `multiSelect` [_boolean_] - Allow more than one choice to be selected.
- `noSpell` [_boolean_] - (combo only) If set and `edit` is true, text entered in the field is not spell-checked.
- `select` [_array_] - Array of choices to display in the combo or list form field.

```js
opts = {
  select: ['', 'github', 'bitbucket', 'gitlab'],
  value: '',
  defaultValue: '',
  align: 'left'
};
doc.formCombo('ch1', 10, y, 100, 20, opts);
```

#### Button Field Options

- `label` [_string_] - Sets the label text. You can also set an icon, but for
  this you will need to 'expert-up' and dig deeper into the PDF Reference manual.

```js
var opts = {
  backgroundColor: 'yellow',
  label: 'Test Button'
};
doc.formPushButton('btn1', 10, 200, 100, 30, opts);
```

### Text Field Formatting

When needing to format the text value of a Form Annotation, the following
`options` are available. This will cause predefined document JavaScript actions
to automatically format the text. Refer to the section _Formatting scripts_ in
[Acrobat Forms
Plugin](https://help.adobe.com/en_US/acrobat/acrobat_dc_sdk/2015/HTMLHelp/#t=Acro12_MasterBook%2FIAC_API_FormsIntro%2FMethods1.htm)
of the Acrobat SDK documentation for more information.

Add a format dictionary to `options`. The dictionary must contain a `type` attribute.

- `format` - generic object
- `format.type` - value must be one of `date`, `time`, `percent`, `number`, `zip`, `zipPlus4`, `phone` or `ssn`.

When `type` is `date`, `time`, `percent` or `number` the format dictionary must
contain additional parameters as described below.

#### Date format

- `format.param` (_string_) - specifies the value and display format and can include:
  - `d` - single digit day of month
  - `dd` - double digit day of month
  - `m` - month digit
  - `mm` - month double digit
  - `mmm` - abbreviated month name
  - `mmmm` - full month name
  - `yy` - two digit year
  - `yyyy` - four digit year
  - `hh` - hour for 12 hour clock
  - `HH` - hour for 24 hour clock
  - `MM` - two digit minute
  - `tt` - am or pm

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
- `format.sepComma` [_boolean_] - display a comma separator, otherwise do not display a separator.
- `format.negStyle` [_string_] (number only) - the value must be one of `MinusBlack` , `Red`, `ParensBlack`, `ParensRed`
- `format.currency` [_string_] (number only) - a currency symbol to display
- `format.currencyPrepend` [_boolean_] (number only) - set to true to prepend the currency symbol

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
    currencyPrepend: true
  }
});
```

## Field Names

Form Annotations are, by default, added to the root of the PDF document. A PDF
form is organized in a name heirarchy, for example _shipping.address.street_.
Capture this heirarchy either by setting the `name` of each _form annotation_ with
the full hierarchical name (e.g. _shipping.address.street_) or by creating a
hierarchy of _form fields_ and _form annotations_ and refering to a form field or form
annotations parent using `options.parent`.

A _form field_ is an invisible node in the PDF form and is created using the
document `formField` method. A form field must include the node's `name` (e.g.
_shipping_) and may include other information such as the default font that is
to be used by all child form annotations.

Using the `formField` method you might create a _shipping_ field that is added
to the root of the document, an _address_ field that refers to the _shipping_
field as it's parent, and a _street_ Form Annotation that would refer to the
_address_ field as it's parent.

Create form fields using the document method:

- `formField( name, options )` - returns a reference to the field

-- _Example PDF using field hierarchy, three text fields and a push
button_ --

```javascript
doc.font('Helvetica'); // establishes the default font
doc.initForm();

let rootField = doc.formField('rootField');
let child1Field = doc.formField('child1Field', { parent: rootField });
let child2Field = doc.formField('child2Field', { parent: rootField });

// Add text form annotation 'rootField.child1Field.leaf1'
doc.formText('leaf1', 10, 10, 200, 40, {
  parent: child1Field,
  multiline: true
});
// Add text form annotation 'rootField.child1Field.leaf2'
doc.formText('leaf2', 10, 60, 200, 40, {
  parent: child1Field,
  multiline: true
});
// Add text form annotation 'rootField.child2Field.leaf1'
doc.formText('leaf1', 10, 110, 200, 80, {
  parent: child2Field,
  multiline: true
});

// Add push button form annotation 'btn1'
var opts = {
  backgroundColor: 'yellow',
  label: 'Test Button'
};
doc.formPushButton('btn1', 10, 200, 100, 30, opts);
```

The output of this example looks like this.

![0](images/Forms.png)

### Advanced Form Field Use

Forms can be quite complicated and your needs will likely grow to sometimes need
to directly specify the attributes that will go into the Form Annotation or
Field dictionaries. Consult the **PDF Reference** and set these attributes in
the `options` object. Any options that are not listed above will be added
directly to the corresponding PDF Object.

## Font

The font used for a Form Annotation is set using the `document.font` method.
Yes that's the same method as is used when setting the text font.

The `font` method must be called before `initForm` and may be called before `formField` or any of the form annotation methods.

```js
doc.font('Courier');
doc.formText('myfield', 10, 10, 200, 20);
```

## Named JavaScript

In support of Form Annotations that execute JavaScript in PDF, you may use the
following document method:

- `addNamedJavaScript( name, string )`

## Limitations

It is recommended that you test your PDF form documents across all platforms and
viewers that you wish to support.

### Form Field Appearances

Form elements must each have an _appearance_ set using the `AP` attribute of the
annotation. If this attribute is not set, the form element's value _may_ not be
visible. Because appearances can be complex to generate, Adobe Acrobat has an
option to build these apperances from form values and Form Annotation
attributes when a PDF is first opened. To do this PDFKit always sets the Form dictionary's
`NeedAppearances` attribute to true. This could mean that the PDF will be
_dirty_ upon open, meaning it will need to be saved.

The `NeedAppearances` flag may not be honored by all PDF viewers.

Some form documents may not need to generate appearances. This may be the case
for text Form Annotations that initially have no value. This is not true for
push button widget annotations. Please test

### Document JavaScript

Many PDF Viewers, aside from Adobe Acrobat Reader, do not implement document
JavaScript. Even Adobe Readers may not implement document JavaScript where it is
not permitted by a device's app store terms of service (e.g. iOS devices).

### Radio and Checkboxes

Support for radio and checkboxes requires a more advanced attention to their
rendered appearances and are not supported in this initial forms release.

---
