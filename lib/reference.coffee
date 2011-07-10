###
PDFReference - represents a reference to another object in the PDF object heirarchy
By Devon Govett
###

zlib = require 'zlib'

class PDFReference
    constructor: (@id, @data) ->
        @gen = 0
        @stream = null
        @finalizedStream = null
        
    object: ->
        out = ["#{@id} #{@gen} obj"]
        out.push PDFObject.convert(@data)
        
        if @stream
            @finalize() if not @finalizedStream
            out.push "stream"
            out.push @finalizedStream
            out.push "endstream"
        
        out.push "endobj"
        return out.join '\n'
        
    add: (s) ->
        @stream ?= []
        @stream.push if Buffer.isBuffer(s) then s.toString('binary') else s
        
    finalize: (compress = false) ->
        # cache the finalized stream
        data = @stream.join '\n'
        if @stream
            if compress
                compressedData = zlib.deflate new Buffer(data)
                @finalizedStream = compressedData.toString 'binary'
            else
                @finalizedStream = data
        else
            @finalizedStream = ''
        
    toString: ->
        "#{@id} #{@gen} R"
        
module.exports = PDFReference
PDFObject = require './object'