TTFFont = require 'fontkit'

class PDFFont
  @open: (document, src, family, id) ->
    if typeof src is 'string'
      if StandardFont.isStandardFont src
        return new StandardFont document, src, id
        
      if /\.(ttf|otf|ttc)$/i.test src
        font = TTFFont.open src, family
                
    else if Buffer.isBuffer(src)
      font = new TTFFont src, family
      
    if not font?
      throw new Error 'Not a supported font format or standard PDF font.'
      
    return new EmbeddedFont document, font, id
    
  constructor: ->
    throw new Error 'Cannot construct a PDFFont directly.'
    
  encode: (text) ->
    throw new Error 'Must be implemented by subclasses'
      
  widthOfString: (text) ->
    throw new Error 'Must be implemented by subclasses'
    
  ref: ->
    @dictionary ?= @document.ref()
    
  finalize: ->
    return if @embedded or not @dictionary?

    @embed()
    @embedded = true
    
  embed: ->
    throw new Error 'Must be implemented by subclasses'
      
  lineHeight: (size, includeGap = false) ->
    gap = if includeGap then @lineGap else 0
    (@ascender + gap - @decender) / 1000 * size
  
module.exports = PDFFont

StandardFont = require './font/standard'
EmbeddedFont = require './font/embedded'
