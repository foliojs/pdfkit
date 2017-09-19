###
PDFReference - represents a reference to another object in the PDF object heirarchy
By Devon Govett
###

zlib = require 'zlib'

class PDFReference
  constructor: (@document, @id, @data = {}) ->
    @gen = 0
    @compress = @document.compress and not @data.Filter
    @uncompressedLength = 0
    @buffer = []

  write: (chunk) ->
    unless Buffer.isBuffer(chunk)
      chunk = new Buffer(chunk + '\n', 'binary')

    @uncompressedLength += chunk.length
    @data.Length ?= 0
    @buffer.push(chunk)
    @data.Length += chunk.length
    if @compress
      @data.Filter = 'FlateDecode'

  end: (chunk) ->
    if chunk
      @write(chunk)
    @finalize()

  finalize: =>
    setTimeout () =>
      @offset = @document._offset

      @document._write "#{@id} #{@gen} obj"
      @document._write PDFObject.convert(@data)

      if @buffer.length
        @buffer = Buffer.concat(@buffer)
        if @compress
          @buffer = zlib.deflateSync(@buffer)
          @data.Length = @buffer.length
        @document._write 'stream'
        @document._write @buffer

        @buffer.length = 0 # free up memory
        @document._write '\nendstream'

      @document._write 'endobj'
      @document._refEnd(this)
    , 0
  toString: ->
    return "#{@id} #{@gen} R"

module.exports = PDFReference
PDFObject = require './object'
