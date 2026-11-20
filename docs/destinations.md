# Destinations

Anchor may specify a destination by `addNamedDestination(name, ...args)`, which consists of a page, the location of the display window on that page, and the zoom factor to use when displaying that page.

Examples of creating anchor:

    // Insert anchor for current page
    doc.addNamedDestination('LINK');

    // Insert anchor for current page with only horizontal magnified to fit where vertical top is 100
    doc.addNamedDestination('LINK', 'FitH', 100);

    // Insert anchor to display a portion of the current page, 1/2 inch in from the top and left and zoomed 50%
    doc.addNamedDestination('LINK', 'XYZ', 36, 36, 50);

    // Insert anchor for this text
    doc.text('End of paragraph', { destination: 'ENDP' });

Each destination type takes a fixed, positional parameter list:

| type | parameters |
| --- | --- |
| `XYZ` | `left`, `top`, `zoom` |
| `Fit` | none |
| `FitH` | `top` |
| `FitV` | `left` |
| `FitR` | `left`, `bottom`, `right`, `top` |
| `FitB` | none |
| `FitBH` | `top` |
| `FitBV` | `left` |

`XYZ` is the only type whose vertical coordinate is converted: give its `top` measured
from the top of the page, as everywhere else in PDFKit. The others are written through
unchanged, so `FitH` and `FitBH`'s `top`, and `FitR`'s `bottom` and `top`, are measured
from the bottom of the page.

A destination carrying more parameters than its type takes is not valid; `FitR` must
carry all four, and `XYZ` at least `left` and `top`. For `XYZ`, `FitH`, `FitV`, `FitBH`
and `FitBV` a parameter may be `null`, which tells the reader to keep that aspect of its
current view. Called with no type at all, `addNamedDestination(name)` writes `XYZ` with
all three parameters `null`.

Examples of go to link to anchor:

    // Go to annotation
    doc.goTo(10, 10, 100, 20, 'LINK')

    // Go to annotation for this text
    doc.text('Another goto', 20, 0, {
   	  goTo: 'ENDP',
   	  underline: true
    });
