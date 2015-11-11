PDFDocument = require '../'
tiger = require './tiger'
fs = require 'fs'

# Create a new PDFDocument
doc = new PDFDocument
doc.pipe fs.createWriteStream('out.pdf')

# Set some meta data
doc.info['Title'] = 'Test Document'
doc.info['Author'] = 'Devon Govett'

# Register a font name for use later
doc.registerFont('Palatino', 'fonts/PalatinoBold.ttf')

# Set the font, draw some text, and embed an image
doc.font('Palatino')
   .fontSize(25)
   .text('Some text with an embedded font!', 100, 100)
   .fontSize(18)
   .text('PNG and JPEG images:')
   .image('images/test.png', 100, 160, width: 412)
   .image('images/test.jpeg', 190, 400, height: 300)

# Add another page
doc.addPage()
   .fontSize(25)
   .text 'Here is some vector graphics...', 100, 100

# Draw a triangle and a circle
doc.save()
   .moveTo(100, 150)
   .lineTo(100, 250)
   .lineTo(200, 250)
   .fill("#FF3300")
   
doc.circle(280, 200, 50)
   .fill("#6600FF")

doc.scale(0.6)
   .translate(470, -380)
   .path('M 250,75 L 323,301 131,161 369,161 177,301 z') # render an SVG path
   .fill('red', 'even-odd') # fill using the even-odd winding rule
   .restore()
   
loremIpsum = '''
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;
Mauris at ante tellus. Vestibulum a metus lectus. Praesent tempor purus a lacus blandit eget gravida ante hendrerit. Cras et eros metus. Sed commodo malesuada eros, vitae interdum augue semper quis. Fusce id magna nunc. Curabitur sollicitudin placerat semper. Cras et mi neque, a dignissim risus. Nulla venenatis porta lacus, vel rhoncus lectus tempor vitae. Duis sagittis venenatis rutrum. Curabitur tempor massa tortor.
'''

# Draw some text wrapped to 412 points wide
doc.text('And here is some wrapped text...', 100, 300)
   .font('Helvetica', 13)
   .moveDown() # move down 1 line
   .text(loremIpsum, width: 412, align: 'justify', indent: 30, paragraphGap: 5, horizontalScaling:50)
   
doc.addPage()

#
# test column layouts with scaling factor
#
doc.text loremIpsum,
  columns: 3
  columnGap: 25
  height: 100
  width: 300
  align: 'justify' 

doc.moveDown() # move down 1 line
  
doc.text loremIpsum,
  columns: 3
  columnGap: 25
  height: 100
  width: 300
  align: 'justify' 
  horizontalScaling: 75

doc.moveDown() # move down 1 line
  
doc.text loremIpsum,
  columns: 3
  columnGap: 25
  height: 100
  width: 300
  align: 'justify' 
  horizontalScaling: 125


doc.addPage()

#
# test rich text and scaling
#
doc.fillColor 'green'
   .text loremIpsum.slice(0, 500),
     width: 465
     continued: yes
   .fillColor 'red'
   .text loremIpsum.slice(500)

doc.moveDown() # move down 1 line

doc.fillColor 'green'
   .text loremIpsum.slice(0, 500),
     width: 465
     horizontalScaling: 60
     continued: yes
   .fillColor 'red'
   .text loremIpsum.slice(500)

doc.moveDown() # move down 1 line

doc.addPage()

# Add the link text
doc.fontSize(25)
   .fillColor('blue')
   .text('This is a link!', 20, 10)
   
# Measure the text
width = doc.widthOfString('This is a link!')
height = doc.currentLineHeight()

# Add the underline and link annotations
doc.underline(20, 10, width, height, color: 'blue')
   .link(20, 10, width, height, 'http://google.com/')
# Create the highlighted text

# Add the link text AT 50% scaling
doc.fontSize(25)
   .fillColor('blue')
   .text('This is a link!', 20, 40, horizontalScaling:50)
   
# Measure the text
width = doc.widthOfString('This is a link!', horizontalScaling:50)
height = doc.currentLineHeight()

# Add the underline and link annotations
doc.underline(20, 40, width, height, color: 'blue')
   .link(20, 40, width, height, 'http://google.com/')
# Create the highlighted text


doc.moveDown()
   .fillColor('black')
   .highlight(20, doc.y, doc.widthOfString('This text is highlighted!'), height)
   .text('This text is highlighted!')
   
doc.moveDown()
   .fillColor('black')
   .highlight(20, doc.y, doc.widthOfString('This text is highlighted!', horizontalScaling:125), height)
   .text('This text is highlighted!', horizontalScaling:125)
   
# Create the crossed out text
doc.moveDown()
   .strike(20, doc.y, doc.widthOfString('STRIKE!'), height)
   .text('STRIKE!')

# Create the crossed out text
doc.strike(20, doc.y, doc.widthOfString('STRIKE!', horizontalScaling:25), height)
   .text('STRIKE!', horizontalScaling:25)

doc.moveDown() # move down 1 line

doc.fontSize 20
   .fillColor 'red'
   .text 'A link at 100%!', 
     link: 'http://apple.com/',
     underline: true,
     
doc.fontSize 20
   .fillColor 'red'
   .text 'A link at 50%!', 
     link: 'http://apple.com/',
     underline: true,
     horizontalScaling: 50
     
doc.fontSize 20
   .fillColor 'red'
   .text 'A link at 150%!', 
     link: 'http://apple.com/',
     underline: true,
     horizontalScaling: 150
     
doc.fontSize 20
   .fillColor 'blue'
   .text 'Strikethrough at 100%!', 
     strike: true,
     horizontalScaling: 100
     
doc.fontSize 20
   .fillColor 'blue'
   .text 'Strikethrough at 50%!', 
     strike: true,
     horizontalScaling: 50
     
doc.fontSize 20
   .fillColor 'blue'
   .text 'Strikethrough at 150%!', 
     strike: true,
     horizontalScaling: 150
     
# Add another page, and set the font back   
doc.addPage()
   .font('Palatino', 25)
   .text('Rendering some SVG paths...', 100, 100)
   .translate(220, 300)

# Render each path that makes up the tiger image
for part in tiger
    doc.save()
    doc.path(part.path) # render an SVG path
    
    if part['stroke-width']
        doc.lineWidth part['stroke-width']
    
    if part.fill isnt 'none' and part.stroke isnt 'none'
        doc.fillAndStroke(part.fill, part.stroke)
    else
        unless part.fill is 'none'
            doc.fill(part.fill)
            
        unless part.stroke is 'none'
            doc.stroke(part.stroke)
            
    doc.restore()

# Add some text with annotations            
doc.addPage()
   .fillColor("blue")
   .text('Here is a link!', 100, 100, { link: 'http://google.com/', underline: true })
   
# Add a list with a font loaded from a TrueType collection file   
doc.fillColor('#000')
   .font('fonts/Chalkboard.ttc', 'Chalkboard', 16)
   .list(['One', 'Two', 'Three'], 100, 150)
        
doc.end()