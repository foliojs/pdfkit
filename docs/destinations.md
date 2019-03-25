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


Examples of go to link to anchor:

    // Go to annotation
    doc.goTo(10, 10, 100, 20, 'LINK')

    // Go to annotation for this text
    doc.text('Another goto', 20, 0, {
   	  goTo: 'ENDP',
   	  underline: true
    });
