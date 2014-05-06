###
PDFImage - embeds images in PDF documents
By Devon Govett
###

fs = require 'fs'
Data = require './data'
JPEG = require './image/jpeg'
PNG = require './image/png'

class PDFImage
  @open: (src, label) ->
    if Buffer.isBuffer(src)
      data = src
    else
      if match = /^data:.+;base64,(.*)$/.exec(src)
        data = new Buffer(match[1], 'base64')

      else
        data = fs.readFileSync src
        return unless data
    
    if data[0] is 0xff and data[1] is 0xd8
      return new JPEG(data, label)
      
    else if data[0] is 0x89 and data.toString('ascii', 1, 4) is 'PNG'
      return new PNG(data, label)
      
    else
      throw new Error 'Unknown image format.'
          
module.exports = PDFImage