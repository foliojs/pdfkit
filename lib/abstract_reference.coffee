###
PDFAbstractReference - abstract class for PDF reference
###

stream = require 'stream'

class PDFAbstractReference extends stream.Writable
  toString: ->
    throw new Error 'Must be implemented by subclasses'
      
module.exports = PDFAbstractReference
