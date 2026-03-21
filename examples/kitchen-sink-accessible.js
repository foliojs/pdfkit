var PDFDocument = require('../');
var tiger = require('./tiger');
var fs = require('fs');

// Create a new PDFDocument
var doc = new PDFDocument({
  pdfVersion: '1.5',
  lang: 'en-US',
  tagged: true,
  displayTitle: true,
  // @ts-ignore PDF/UA needs to be enforced for PAC accessibility checker
  subset: 'PDF/UA',
});

doc.pipe(fs.createWriteStream('kitchen-sink-accessible.pdf'));

// Set some meta data
doc.info['Title'] = 'Test Document';
doc.info['Author'] = 'Devon Govett';

// Initialise document logical structure
var struct = doc.struct('Document');
doc.addStructure(struct);

// Register a font name for use later
doc.registerFont('Palatino', 'fonts/PalatinoBold.ttf');

// Set the font and draw some text
struct.add(
  doc.struct('P', () => {
    doc
      .font('Palatino')
      .fontSize(25)
      .text('Some text with an embedded font! ', 100, 100);
  })
);

// Embed some images
var imageSection = doc.struct('Sect');
struct.add(imageSection);

doc.outline.addItem('PNG and JPEG images:'); // add a bookmark for the image section's H1
imageSection.add(
  doc.struct('H1', () => {
    doc.fontSize(18).text('PNG and JPEG images: ');
  })
);

imageSection.add(
  doc.struct(
    'Figure',
    {
      alt: 'Promotional image of an Apple laptop. ',
      bbox: [100, 160, 512, 387]
    },
    () => {
      doc.image('images/test.png', 100, 160, {
        width: 412
      });
    }
  )
);

imageSection.add(
  doc.struct(
    'Figure',
    {
      alt:
        'Photograph of a path flanked by blossoming trees with surrounding hedges. ',
      bbox: [190, 400, 415, 700]
    },
    () => {
      doc.image('images/test.jpeg', 190, 400, {
        height: 300
      });
    }
  )
);

imageSection.end();

// Add another page
doc.addPage();

// Draw a triangle, a circle and a star
var vectorSection = doc.struct('Sect');
struct.add(vectorSection);

doc.outline.addItem('Vector graphics:'); // add a bookmark for the vector graphics section's H1
vectorSection.add(
  doc.struct('H1', () => {
    doc.fontSize(25).text('Here are some vector graphics... ', 100, 100);
  })
);

vectorSection.add(
  doc.struct(
    'Figure',
    {
      alt: 'Orange triangle. ',
      bbox: [100, 150, 200, 250]
    },
    () => {
      // we set fill color before path construction to comply with ISO 32000-2 Figure 9
      doc
        .save()
        .fillColor('#FF8800')
        .moveTo(100, 150)
        .lineTo(100, 250)
        .lineTo(200, 250)
        .fill()
        .restore();
    }
  )
);

vectorSection.add(
  doc.struct(
    'Figure',
    {
      alt: 'Purple circle. ',
      bbox: [230, 150, 330, 250]
    },
    () => {
      // we set fill color before path construction to comply with ISO 32000-2 Figure 9
      doc.save().fillColor('#7722FF').circle(280, 200, 50).fill().restore();
    }
  )
);

vectorSection.add(
  doc.struct(
    'Figure',
    {
      alt: 'Red star with hollow center. ',
      bbox: [360, 128, 504, 266]
    },
    () => {
      // we set fill color before path construction to comply with ISO 32000-2 Figure 9
      doc
        .save()
        .fillColor('red')
        .scale(0.6)
        .translate(470, 140)
        // render an SVG path
        .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
        // fill using the even-odd winding rule
        .fill('even-odd')
        .restore();
    }
  )
);

vectorSection.end();

// Draw some text wrapped to 412 points wide, split into paragraphs
var wrappedSection = doc.struct('Sect');
struct.add(wrappedSection);

doc.outline.addItem('PNG and JPEG images:'); // add a bookmark for the wrapped text section's H1
wrappedSection.add(
  doc.struct('H1', () => {
    doc
      .text('And here is some wrapped text... ', 100, 300)
      .font('Helvetica', 13)
      // move down 1 line
      .moveDown();
  })
);

var loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;\nMauris at ante tellus. Vestibulum a metus lectus. Praesent tempor purus a lacus blandit eget gravida ante hendrerit. Cras et eros metus. Sed commodo malesuada eros, vitae interdum augue semper quis. Fusce id magna nunc. Curabitur sollicitudin placerat semper. Cras et mi neque, a dignissim risus. Nulla venenatis porta lacus, vel rhoncus lectus tempor vitae. Duis sagittis venenatis rutrum. Curabitur tempor massa tortor.';
doc.font('Palatino').text(loremIpsum, {
  width: 412,
  align: 'justify',
  indent: 30,
  paragraphGap: 5,
  structParent: wrappedSection
});

wrappedSection.end();

// Add another page
doc.addPage();

// Set the font back and draw tiger line art based on an SVG
var tigerSection = doc.struct('Sect');
struct.add(tigerSection);

doc.outline.addItem('Tiger line art:'); // add a bookmark for the tiger section's H1
tigerSection.add(
  doc.struct('H1', () => {
    doc
      .font('Palatino', 25)
      .text('Rendering some SVG paths...', 100, 100)
      .translate(220, 300);
  })
);

tigerSection.add(
  doc.struct(
    'Figure',
    {
      alt: 'Tiger line art. ',
      bbox: [30, 140, 540, 680]
    },
    () => {
      var i, len, part;
      // Render each path that makes up the tiger image
      for (i = 0, len = tiger.length; i < len; i++) {
        part = tiger[i];
        doc.save();
        // we set fill color before path construction to comply with ISO 32000-2 Figure 9
        if (part.fill !== 'none') {
          doc.fillColor(part.fill);
        }
        if (part.stroke !== 'none') {
          doc.strokeColor(part.stroke);
        }
        if (part['stroke-width']) {
          doc.lineWidth(part['stroke-width']);
        }
        doc.path(part.path); // render an SVG path
        if (part.fill !== 'none' && part.stroke !== 'none') {
          doc.fillAndStroke();
        } else {
          if (part.fill !== 'none') {
            doc.fill();
          }
          if (part.stroke !== 'none') {
            doc.stroke();
          }
        }
        doc.restore();
      }
    }
  )
);

tigerSection.end();

// Add another page
doc.addPage();

// Add some text with annotations
var linkSection = doc.struct('Sect');
struct.add(linkSection);

var linkParagraph = doc.struct('P');
linkSection.add(linkParagraph);

linkParagraph.add(
  doc.struct(
    'Link',
    {
      alt: 'Here is a link! '
    },
    () => {
      doc.fillColor('blue').text('Here is a link!', 100, 100, {
        link: 'http://google.com/',
        underline: true
      });
    }
  )
);

linkParagraph.end();
linkSection.end();

// Add a list with a font loaded from a TrueType collection file
var listSection = doc.struct('Sect');
struct.add(listSection);

var list = doc.struct('L');
listSection.add(list);

doc
  .fillColor('#000')
  .font('fonts/Chalkboard.ttc', 'Chalkboard', 16)
  .list(['One, ', 'Two, ', 'Three. '], 100, 150, { structParent: list });

listSection.end(); // This recursively ends the list as well

// End and flush the document
doc.end();
