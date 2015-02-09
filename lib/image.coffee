###
PDFImage - embeds images in PDF documents
By Devon Govett
###

fs = require 'fs'
JPEG = require './image/jpeg'
PNG = require './image/png'
stream = require 'stream'

class PDFImage
  @open: (src, label) ->
    if src instanceof ArrayBuffer
      src = new Buffer(new Uint8Array(src))

    else if src instanceof Uint8Array
      src = new Buffer(src)

    else if typeof src is 'string' and (match = /^data:.+;base64,(.*)$/.exec(src))
      src = new Buffer(match[1], 'base64')
            
    else if typeof src isnt 'string' and not Buffer.isBuffer(src)
      throw new Error 'Unsupported input passed to doc.image. Must be a path, buffer, arraybuffer, uint8array, or base64 string.'
    
    if Buffer.isBuffer(src)
      source = new stream.PassThrough
      source.end src
    else
      source = new SyncFileStream src
    
    chunk = source.read(4)
    source.unshift chunk
    
    if chunk.readUInt16BE(0) is 0xffd8
      return new JPEG source, label

    else if chunk[0] is 0x89 and chunk.toString('ascii', 1, 4) is 'PNG'
      return new PNG source, label

    else
      throw new Error 'Unknown image format.'

# This subclass of fs.ReadStream starts out reading synchronously,
# but switches to asynchronous mode when piped somewhere.
# This allows us to read image dimensions and other metadata that
# usually occurs at the start of the file synchronously, but do the
# rest of our reading and decoding asynchronously.
class SyncFileStream extends fs.ReadStream
  constructor: (filename) ->
    super
    @bufferSize = 1024
    @sync = true
    
  open: ->
    @fd = fs.openSync @path, @flags, @mode
    @emit 'open', @fd
    
  _read: (size) ->
    unless @sync
      return super

    chunk = new Buffer @bufferSize
    bytesRead = fs.readSync @fd, chunk, 0, chunk.length
    
    if bytesRead > 0
      @push chunk.slice(0, bytesRead)
    else
      @push null
      
  pipe: (dest) ->
    @sync = false
    super
          
module.exports = PDFImage
