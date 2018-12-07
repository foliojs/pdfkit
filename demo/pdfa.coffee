PDFDocument = require '../lib/document'
fs = require 'fs'
lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;\nMauris at ante tellus. Vestibulum a metus lectus. Praesent tempor purus a lacus blandit eget gravida ante hendrerit. Cras et eros metus. Sed commodo malesuada eros, vitae interdum augue semper quis. Fusce id magna nunc. Curabitur sollicitudin placerat semper. Cras et mi neque, a dignissim risus. Nulla venenatis porta lacus, vel rhoncus lectus tempor vitae. Duis sagittis venenatis rutrum. Curabitur tempor massa tortor.'
#
# you could read this from a file (e.g. server) or generate it (e.g. in the browser)
#
fileContent = '<?xml version="1.0" encoding="UTF-8"?><note>Test Doc</note>'

#
# we can embed files in the pdf (/EmbeddedFiles)
# if PDF/A-3 is requested, files will also appear in PDF/A-3 Associated Files (/AF) section
#
#
# we can give additional XMP RDF to be injected in the pdf
# Note: do not include attribute "rdf:about" as it is added automatically
#       with the correct file identifier
#

#
# pdf document creation
#
doc = new PDFDocument
  pdfa: true,
  info:
    Title: 'PDF/A Demo'
    Keywords: 'PDF/A; PDFKit'
    Author: 'John Doe'
    Subject: 'Creating a PDF/A with PDFKit'

doc.registerFont('DefaultFont', __dirname + '/fonts/DejaVuSans.ttf')
doc.pipe fs.createWriteStream(__dirname + '/pdfa-demo.pdf')
doc.font('DefaultFont')
   .text('Transections', 100, 100)


data = [
  { code: '0001', name: 'Black table', quantity: '10', price: '$ 19.20' }
  { code: '0005', name: 'White table', quantity: '8',  price: '$ 19.20' }
  { code: '0012', name: 'Red chair',   quantity: '40', price: '$ 12.00' }
]
	
options =
	columns: [
		{ id: 'code',     width: 10, name: 'Code' }
		{ id: 'name',     width: 40, name: 'Name' }
		{ id: 'quantity', width: 25, name: 'Quantity' }
		{ id: 'price',    width: 25, name: 'Price' }
	]
	font: 'Helvetica'
	boldFont: 'Palatino-Bold'
	margins:
		left: 20
		top: 40
		right: 20
		bottom: 0
	padding:
		left: 10
		top: 10
		right: 10
		bottom: 10


doc.table(data, options)

doc.end()
