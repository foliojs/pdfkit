# Accessibility

Accessible PDFs are usable by visually impaired users who rely on
screen readers/text-to-speech engines/vocalisation.

## Marked Content

Marked content sequences are foundational to creating accessible PDFs.

All marked content sequences are associated with a registered tag, such as 'Span'.

Example of marking content:

    // Mark some text as a "Span"
    doc.markContent('Span');
    doc.text('Hello, world!');
    doc.endMarkedContent();

Marked content is automatically ended when a page is ended, and if a new page is automatically
added by text wrapping, marking is automatically begun again on the new page.

## Logical Structure

Logical structures defines the reading order of a document, and can provide alternative text
for images and other visual content.

To define logical structure, you need to mark the structure content, keep a reference to it,
then incorporate it into a structure tree.

> So far, PDFKit only supports marked content in the logical structure, not annotations, forms,
> or anything else.

Example of marking structure content:

    // Mark some text as a paragraph ("P"); the tag should match the intended structure element's type
    const myStructContent = doc.markStructureContent('P');
    doc.text('Hello, world!');
    doc.endMarkedContent();

Example of the simplest of structure trees:

    // Add a single structure element which includes the structure content to the document's structure
    doc.addStructure(doc.struct('P', [ myStructContent ]));

### Automatic Ending of Structure Content

Structure content does not nest; marking structure content will automatically end current
marking of structure content (and any descendent marking):

    // Mark multiple paragraphs without needing to close them
    const myStructContent = doc.markStructureContent('P');
    doc.text('Hello, world!');
    const myStructContent = doc.markStructureContent('P');
    doc.markContent('Span');
    doc.text('Bonjour, tout le monde!');
    const myStructContent = doc.markStructureContent('P');
    doc.text('Hello again!');

### Complex Structure

Multiple elements may be added directly to the document, and may nest:

    // Create nested structure elements
    const section1 = doc.struct('Section', [
        doc.struct('P', [
            someTextStructureContent,
            doc.struct('Link', [ someLinkStructureContent ]),
            moreTextStructureContent
        ])
    ]);
    const section2 = doc.struct('Section', [ secondSectionStructureContent ]);

    // Add them to the document's structure
    doc.addStructure(section1).addStructure(section2);

### Incremental Construction of Structure

Structure can be built incrementally. Elements can optionally be (recursively) ended once
you have finished adding to them, allowing them to be flushed out as soon as possible:

    // Begin a new section and add it to the document's structure
    const mySection = doc.struct('Section');
    doc.addToStructure(mySection);

    // Create a new paragraph and add it to the section
    const myParagraph = doc.struct('P');
    mySection.add(myParagraph);

    // Add content, both to the page, and the paragraph
    const myParagraphContent = doc.markStructureContent('P');
    myParagraph.add(myParagraphContent);
    doc.text('Hello, world!');

    // End the paragraph, allowing it to be flushed out, freeing memory
    myParagraph.end();

Note that if you provide content when creating a structure element (i.e. providing it to
`doc.struct()` rather than using `structElem.add()`) then `structElem.end()` is called
automatically. You therefore should not add additional content, as the element may already have
been flushed out. Do not mix atomic and incremental styles for the same structure element.

### Structure Element Options

When creating a structure element, you can provide options:

 * `title` - title of the structure element (e.g. "Chapter 1")
 * `lang` - human language code (e.g. `en-AU`) which overrides default document language
 * `alt` - alternative text for an image or other visual content
 * `expanded` - the expanded form of an abbreviation or acronym
 * `actual` - the actual text the content represents (e.g. if it is rendered as vector graphics)

Example of a structure tree with options specified:

    const titlePage = doc.struct('Section', {
        title: 'Title Page'
    }, [
        doc.struct('H', [
            doc.struct('Span', {
                expanded: 'Portable Document Format/Universal Accessibility',
                actual: 'PDF/UA'
            }, [
                pdfUAStructureContent
            ]),
            doc.struct('Span', {
                actual: 'in a Nutshell'
            }, [
                inANutshellStructureContent
            ]),
        ]),
        doc.struct('Figure', {
            alt: 'photo of a concrete path with tactile paving'
        }, [
            photoStructureContent
        ])
    ]);
