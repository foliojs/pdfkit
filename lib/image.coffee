###
PDFImage - embeds images in PDF documents
By Devon Govett
###

fs = require 'fs'
Data = require './data'
JPEG = require './image/jpeg'
PNG = require './image/png'

class PDFImage

  @toBuffer: (src) ->
    if Buffer.isBuffer(src)
      src
    else if src instanceof ArrayBuffer
      new Buffer(new Uint8Array(src))
    else if match = /^data:.+;base64,(.*)$/.exec(src)
      new Buffer(match[1], 'base64')
    else
      fs.readFileSync src

  @open: (src, label) ->
    data = @toBuffer src
    if data

      if JPEG.is(data)
        return new JPEG(data, label)

      else if PNG.is(data)
        return new PNG(data, label)

      else
        throw new Error 'Unknown image format.'

module.exports = PDFImage
