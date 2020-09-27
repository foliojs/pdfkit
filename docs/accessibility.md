# Accessibility

Marked content sequences are foundational to creating accessible PDFs, which are usable by
visually impaired users who rely on screen readers/text-to-speech engines/vocalisation.

All marked content sequences are associated with a registered tag, such as 'Span'.

Example of marking content:

    // Mark some text as a "Span"
    doc.markContent('Span');
    doc.text('Hello, world!');
    doc.endMarkedContent();

Marked content is automatically ended when a page is ended, and if a new page is automatically
added by text wrapping, marking is automatically begun again on the new page.
