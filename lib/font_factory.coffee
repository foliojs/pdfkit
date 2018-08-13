fontkit = require 'fontkit'
StandardFont = require './font/standard'
EmbeddedFont = require './font/embedded'

class PDFFontFactory
  @open: (document, src, family, id) ->
    if typeof src is 'string'
      if StandardFont.isStandardFont src
        return new StandardFont document, src, id
        
      font = fontkit.openSync src, family
                
    else if Buffer.isBuffer(src)
      font = fontkit.create src, family
      
    else if src instanceof Uint8Array
      font = fontkit.create new Buffer(src), family
      
    else if src instanceof ArrayBuffer
      font = fontkit.create new Buffer(new Uint8Array(src)), family
      
    if not font?
      throw new Error 'Not a supported font format or standard PDF font.'
      
    return new EmbeddedFont document, font, id

      
module.exports = PDFFontFactory
