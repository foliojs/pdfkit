PDFDocument = require 'pdfkit'

options = new Object
options.hasOutlines = true

# Create a new PDFDocument
doc = new PDFDocument(options)

# Set some meta data
doc.info['Title'] = 'Test Document'
doc.info['Author'] = 'Alex'

# Set the font, draw some text
doc.fontSize(25)
   .text('Hello, world!', 100, 100)

doc.addOutline("First page", doc.page)

# Add another page
doc.addPage()
doc.fontSize(10)
doc.text('This is a second page.', 100, 100)

doc.addOutline("Second page", doc.page);
  
doc.write 'out_outlines.pdf'
