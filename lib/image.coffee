###
PDFImage - embeds images in PDF documents
By Devon Govett
###

fs = require 'fs'
Data = require './data'
JPEG = require './image/jpeg'
PNG = require './image/png'

toBuffer = (src) ->
  if Buffer.isBuffer(src)
    src
  else if src instanceof ArrayBuffer
    new Buffer(new Uint8Array(src))
  else if match = /^data:.+;base64,(.*)$/.exec(src)
    new Buffer(match[1], 'base64')
  else
    fs.readFileSync src

class PDFImage

  @open: (src, label, alphaSrc) ->
    data = toBuffer src

    if alphaSrc
      alphaData = toBuffer alphaSrc
      if not JPEG.is alphaData
        throw Error 'Alpha mask must be a gray JPEG image'
      alpha = new JPEG alphaData
      if alpha.colorSpace != 'DeviceGray'
        throw Error 'Alpha mask must be a gray JPEG image'

    if data
      if JPEG.is(data)
        return new JPEG(data, label, alpha)

      else if PNG.is(data)
        return new PNG(data, label, alpha)

      else
        throw new Error 'Unknown image format.'

module.exports = PDFImage
