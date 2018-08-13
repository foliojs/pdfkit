class PDFFont    
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
    (@ascender + gap - @descender) / 1000 * size
  
module.exports = PDFFont
