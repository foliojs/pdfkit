http = require 'http'
PDFDocument = require 'pdfkit'

server = (require 'http').createServer (req, res) ->
  doc = new PDFDocument
  doc.text 'It works!'
  doc.output (out) ->
    res.writeHead 200, {'Content-Type': 'application/pdf'}
    res.end out, 'binary'

server.listen 1337
