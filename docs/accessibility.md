# Accessibility

Accessible PDFs are usable by visually impaired users who rely on
screen readers/text-to-speech engines/vocalisation.

The two main tasks required to create accessible PDFs are marking content and defining the
document's logical structure. These are detailed in the following sections.

Some other simpler tasks are also required.

This checklist covers everything that is required to create a conformant PDF/UA (PDF for
Universal Accessibility) document (which is an extension of Tagged PDF):

 * Pass the option `pdfVersion: '1.5'` (or a higher version) when creating your `PDFDocument`
   (depending on the features you use, you may only need 1.4; refer to the PDF reference for
   details).
 * Pass the option `subset: 'PDF/UA'` when creating your `PDFDocument` (if you wish the PDF to
   be identified as PDF/UA-1).
 * Pass the option `tagged: true` when creating your `PDFDocument` (technically, this sets the
   `Marked` property in the `Markings` dictionary to `true` in the PDF).
 * Provide a `Title` in the `info` option, and pass `displayTitle: true` when creating your
   `PDFDocument`.
 * Specify natural language in the document options and/or logical structure and/or
   non-structure marked `Span` content.
 * Add logical structure with all significant content included.
 * Include accessibility information (such as alternative text, actual text, etc.) in the
   logical structure and/or non-structure marked `Span` content.
 * Include all spaces which separate words/sentences/etc. in your marked structure content,
   even at the ends of lines, paragraphs, etc.. I.e. don't do `doc.text("Hello, world!")` but
   instead do `doc.text("Hello, world! ")`.
 * Mark all non-structure content as artifacts.
 * As well as creating the logical structure, write objects to the PDF in the natural
   "reading order".
 * Do not convey information solely using visuals (such as colour,
   contrast or position on the page).
 * No flickering or flashing content.

## Marked Content

Marked content sequences are foundational to creating accessible PDFs.

All marked content sequences are associated with a registered tag, such as 'Span'.

Example of marking content:

    // Mark some text as a "Span"
    doc.markContent('Span');
    doc.text('Hello, world! ');
    doc.endMarkedContent();

Marked content is automatically ended when a page is ended, and if a new page is automatically
added by text wrapping, marking is automatically begun again on the new page.

Tags to use are listed in a later section.

### Marked Content Options

When marking content, you can provide options (take care to use correct capitalisation):

 * `type` - used for artifact content; may be `Pagination` (e.g. headers and footers),
   `Layout` (e.g. rules and backgrounds) or `Page` (cut marks etc.)
 * `bbox` - bounding box for artifact content: `[left, top, right, bottom]` in default
   coordinates
 * `attached` - used for `Pagination` artifact content, array of one or more strings:
   `Top`, `Bottom`, `Left`, `Right`
 * `lang` - used for `Span` content: human language code (e.g. `en-AU`) which overrides default
   document language, and any enclosing structure element language
 * `alt` - used for `Span` content: alternative text for an image or other visual content
 * `expanded` - used for `Span` content: the expanded form of an abbreviation or acronym
 * `actual` - used for `Span` content: the actual text the content represents (e.g. if it is
   rendered as vector graphics)

It is advisable not to use `Span` content for specifying alternative text, expanded form, or
actual text, especially if there is a possibility of the content automatically wrapping, which
would result in the text appearing twice. Set these options on an associated structure element
instead.

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
    doc.text('Hello, world! ');
    doc.endMarkedContent();

Example of the simplest of structure trees:

    // Add a single structure element which includes the structure content to the document's structure
    doc.addStructure(doc.struct('P', myStructContent));

Tags/element types to use are listed in a later section.

Note that to be conformant to Tagged PDF, all content not part of the logical structure should
be marked as `Artifact`.

### Automatic Ending of Structure Content and Artifacts

Structure content does not nest, and is mutually exclusive with artifact content; marking
structure or artifact content will automatically end current marking of structure or artifact
content (and any descendent marking):

    // Mark multiple paragraphs without needing to close them
    doc.markContent('Artifact', { type: "Layout" });
    doc.rect(x1, y1, w1, h1);
    const myStructContent = doc.markStructureContent('P');
    doc.text('Hello, world! ');
    doc.markContent('Artifact', { type: "Layout" });
    doc.rect(x2, y2, w2, h2);
    const myStructContent = doc.markStructureContent('P');
    doc.markContent('Span');
    doc.text('Bonjour, tout le monde! ');
    doc.markContent('Artifact', { type: "Layout" });
    doc.rect(x3, y3, w3, h3);
    const myStructContent = doc.markStructureContent('P');
    doc.text('Hello again! ');

### Complex Structure

Multiple elements may be added directly to the document, or to structure elements, and may nest:

    // Create nested structure elements
    const section1 = doc.struct('Sect', [
        doc.struct('P', [
            someTextStructureContent,
            doc.struct('Link', someLinkStructureContent),
            moreTextStructureContent
        ])
    ]);
    const section2 = doc.struct('Sect', secondSectionStructureContent);

    // Add them to the document's structure
    doc.addStructure(section1).addStructure(section2);

### Incremental Construction of Structure

Structure can be built incrementally. Elements can optionally be (recursively) ended once
you have finished adding to them, allowing them to be flushed out as soon as possible:

    // Begin a new section and add it to the document's structure
    const mySection = doc.struct('Sect');
    doc.addStructure(mySection);

    // Create a new paragraph and add it to the section
    const myParagraph = doc.struct('P');
    mySection.add(myParagraph);

    // Add content, both to the page, and the paragraph
    const myParagraphContent = doc.markStructureContent('P');
    myParagraph.add(myParagraphContent);
    doc.text('Hello, world! ');

    // End the paragraph, allowing it to be flushed out, freeing memory
    myParagraph.end();

Note that if you provide children when creating a structure element (i.e. providing them to
`doc.struct()` rather than using `structElem.add()`) then `structElem.end()` is called
automatically. You therefore cannot add additional children with `structElem.add()`, i.e.
you cannot mix atomic and incremental styles for the same structure element.

For an element to be flushed out, it must:

 * be ended,
 * have been added to its parent, and
 * if it has content defined through closures (see next section), be attached to the document's
   structure (through its ancestors)

When you call `doc.end()`, the document's structure is recursively ended, resulting in all
elements being flushed out. If you created elements but forgot to add them to the document's
structure, they will not be flushed, but the PDF stream will wait for them to be flushed before
ending, causing your application to hang. Make sure if you create any elements, you add them
to a parent, so ultimately all elements are attached to the document. It's best to add
elements to their parents as you go.

### Shortcut for Elements Containing Only Marked Content

The common case where a structure element contains only content marked with a tag matching
the structure element type can be achieved by using a closure:

    doc.addStructure(doc.struct('P', () => {
        doc.text('Hello, world! ');
    }));

This is equivalent to:

    const myStruct = doc.struct('P');
    doc.addStructure(myStruct);
    const myStructContent = doc.markStructureContent('P');
    doc.text('Hello, world! ');
    doc.endMarkedContent();
    myStruct.add(myStructContent);
    myStruct.end();

Note that the content is marked and the closure is executed *if/when the element is attached to
the document's structure*. This means that you can do something like this:

    const myParagraph = doc.struct('P', [
        () => { doc.text("Please see ", { continued: true }); },
        doc.struct('Link', () => {
            doc.text("something", { link: "http://www.example.com/", continued: true });
        }),
        () => { doc.text(" for details. ", { link: null }); }
    ]);

and no content will be added to the page until/unless something like this is done:

    doc.addStructure(section1);
    section1.add(myParagraph); // Content is added now

or alternatively:

    section1.add(myParagraph);
    doc.addStructure(section1); // Content is added now

This is important because otherwise when the `Link` element is constructed, its content
will be added to the page, and then the list containing the link element will be passed to
the construct the `P` element, and only during the construction of the `P` element will the
other `P` content be added to the page, resulting in page content being out of order.
It's best to add elements to their parents as you go.

### Structure Element Options

When creating a structure element, you can provide options:

 * `title` - title of the structure element (e.g. "Chapter 1")
 * `lang` - human language code (e.g. `en-AU`) which overrides default document language
 * `alt` - alternative text for an image or other visual content
 * `expanded` - the expanded form of an abbreviation or acronym
 * `actual` - the actual text the content represents (e.g. if it is rendered as vector graphics)

Example of a structure tree with options specified:

    const titlePage = doc.struct('Sect', {
        title: 'Title Page'
    }, [
        doc.struct('H', [
            doc.struct('Span', {
                expanded: 'Portable Document Format for Universal Accessibility',
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

### Automatic Marking and Structure Construction for Text

The `text()` method accepts a `structParent` option which you can use to specify a structure
element to add each paragraph to. It will mark each paragraph of content, create a structure
element for it, and then add it to the parent element you provided. It will use the `P` type,
unless you specify a different type with a `structType` option.

Example of creating structure automatically with `text()`:

    // Create a section, add it to the document structure, then add paragraphs to it
    const section = doc.struct('Sect');
    doc.addStructure(section);
    doc.text("Foo. \nBar. ", { structParent: section });

This is equivalent to:

    const section = doc.struct('Sect');
    doc.addStructure(section);
    section.add(doc.struct('P', () => { doc.text("Foo. "); });
    section.add(doc.struct('P', () => { doc.text("Bar. "); });

The `list()` method also accepts a `structParent` option. By default, it add list items
(type `LI`) to the parent, each of which contains a label (type `Lbl`, which holds the bullet,
number, or letter) and a body (type `LBody`, which holds the actual item content). You can
override the default types with a `structTypes` option, which is a list:
`[ itemType, labelType, bodyType ]`. You can make any of the types `null` to omit that
part of the structure (i.e. to add labels and bodies directly to the parent, and/or to collapse
the label and body into a single element).

Example of creating structure automatically with `list()`:

    // Create a list, add it to the structure tree, then add items to it
    const list = doc.struct('List');
    someElement.add(list);
    doc.list(["Foo. ", "Bar. "], { structParent: list });

## Tags and Structure Element Types

Here are the tags and structure element types which are defined in Tagged PDF. You must
ensure you give them with the correct capitalisation.

> Tagged PDF also supports custom types which map to standard types, but PDFKit does not
> have support for this.

Non-structure tags:

 * `Artifact` - used to mark all content not part of the logical structure
 * `ReversedChars` - every string of text has characters in reverse order for technical reasons
   (due to how fonts work for right-to-left languages); strings may have spaces at the
   beginning or end to separate words, but may not have spaces in the middle

"Grouping" elements:

 * `Document` - whole document; must be used if there are multiple parts or articles
 * `Part` - part of a document
 * `Art` - article
 * `Sect` - section; may nest
 * `Div` - generic division
 * `BlockQuote` - block quotation
 * `Caption` - describing a figure or table
 * `TOC` - table of contents, may be nested, and may be used for lists of figures, tables, etc.
 * `TOCI` - table of contents (leaf) item
 * `Index` - index (text with accompanying `Reference` content)
 * `NonStruct` - non-structural grouping element (element itself not intended to be exported to
   other formats like HTML, but 'transparent' to its content which is processed normally)
 * `Private` - content only meaningful to the creator (element and its content not intended to
   be exported to other formats like HTML)

"Block" elements:

 * `H` - heading (first element in a section, etc.)
 * `H1` to `H6` - heading of a particular level intended for use only if nesting sections
   is not possible for some reason
 * `P` - paragraph
 * `L` - list; should include optional `Caption`, and list items
 * `LI` - list item; should contain `Lbl` and/or `LBody`
 * `Lbl` - label (bullet, number, or "dictionary headword")
 * `LBody` - list body (item text, or "dictionary definition"); may have nested lists or other blocks

"Table" elements:

 * `Table` - table; should either contain `TR`, or `THead`, `TBody` and/or `TFoot`
 * `TR` - table row
 * `TH` - table heading cell
 * `TD` - table data cell
 * `THead` - table header row group
 * `TBody` - table body row group; may have more than one per table
 * `TFoot` - table footer row group

"Inline" elements:

 * `Span` - generic inline content
 * `Quote` - inline quotation
 * `Note` - e.g. footnote; may have a `Lbl` (see "block" elements)
 * `Reference` - content in a document that refers to other content (e.g. page number in an index)
 * `BibEntry` - bibliography entry; may have a `Lbl` (see "block" elements)
 * `Code` - code
 * `Link` - hyperlink; should contain a link annotation
 * `Annot` - annotation (other than a link)
 * `Ruby` - Chinese/Japanese pronunciation/explanation
 * `RB` - Ruby base text
 * `RT` - Ruby annotation text
 * `RP` - Ruby punctuation
 * `Warichu` - Japanese/Chinese longer description
 * `WT` - Warichu text
 * `WP` - Warichu punctuation

"Illustration" elements (should have `alt` and/or `actualtext` set):

 * `Figure` - figure
 * `Formula` - formula
 * `Form` - form widget
