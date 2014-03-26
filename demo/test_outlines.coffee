PDFDocument = require 'pdfkit'

docOptions = {
         hasOutlines: true,   # required for outlines
         margins: { top : 40, left : 40, bottom : 40, right : 30 } }


# Create a new PDFDocument
doc = new PDFDocument(docOptions)
doc.fontSize(16)
title = 'Test Document With Outlines'

# add outline on current level (0), with outline options: 
# 'FitH' - top coordinate is positioned at the top edge of the window,
#          document fits the entire width.
# Can be any type according to PDF 1.3 specification, 7.2.1 Destinations (Table 7.2)
doc.addOutline( title, doc.page, { type: 'FitH', top : 0 } )

# text to point by outline should be added next
doc.text(title, { paragraphGap : 8, align : 'center' } )

doc.fontSize(12)  # usual text

doc.info['Title']  = title
doc.info['Author'] = 'Alexey Voytenko'

loremIpsum_0_1 = 'LOREM IPSUM DOLOR.
 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus.
 Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; 
 Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. 
  Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta.'

loremIpsum_1_1 = 'CRAS LEO NEQUE.
  Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. 
  Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi,
   ut tincidunt lacus arcu eu elit.'

loremIpsum_1_2 = 'AENEAN VELIT ERAT.
Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. 
Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. 
Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. 
Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;
Mauris at ante tellus. Vestibulum a metus lectus. Praesent tempor purus a lacus blandit eget 
gravida ante hendrerit.'

loremIpsum_0_2 = 'CRAS ET EROS METUS.
Cras et eros metus. Sed commodo malesuada eros, vitae interdum augue semper quis. 
Fusce id magna nunc. Curabitur sollicitudin placerat semper. Cras et mi neque, a dignissim risus. 
Nulla venenatis porta lacus, vel rhoncus lectus tempor vitae. Duis sagittis venenatis rutrum. 
Curabitur tempor massa tortor.'

# add outline on current level (0) with default options - 'XYZ', positioning on text
doc.addOutline('Lorem ipsum dolor', doc.page);

doc.text( loremIpsum_0_1,
   { paragraphGap : 2, indent : 30, align : 'justify' } )

# create next level (1) of table of contents and add outline
doc.addSublevelOutline('Cras leo neque', doc.page);
doc.text( loremIpsum_1_1, { paragraphGap : 2, indent : 30, align : 'justify' } );

# add outline on the same level 1 with positioning on text
doc.addOutline('Aenean velit erat', doc.page );

doc.text( loremIpsum_1_2, { paragraphGap : 2, indent : 30, align : 'justify' } );

# go up in outlines levels
doc.endOutlineSublevel();

outl_options = { type: 'XYZ', unicode: true }

# add outline on the level 0 with positioning on text ('XYZ' is by default), 
# using non-ASCII characters in outline title: set unicode in this case 
doc.addOutline('Тестовый заголовок', doc.page, outl_options);

doc.text( loremIpsum_0_2, { paragraphGap : 2, indent : 30, align : 'justify' } );

doc.write 'out_outlines.pdf'
console.log "out_outlines.pdf created" 
