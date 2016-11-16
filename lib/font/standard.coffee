AFMFont = require './afm'
PDFFont = require '../font'

class StandardFont extends PDFFont
  constructor: (@document, @name, @id) ->
    @font = new AFMFont STANDARD_FONTS[@name]
    {@ascender,@descender,@bbox,@lineGap,@xHeight,@capHeight} = @font

  embed: ->
    @dictionary.data =
      Type: 'Font'
      BaseFont: @name
      Subtype: 'Type1'
      Encoding: 'WinAnsiEncoding'
      
    @dictionary.end()

  encode: (text) ->
    encoded = @font.encodeText text
    glyphs = @font.glyphsForString '' + text
    advances = @font.advancesForGlyphs glyphs
    positions = []
    for glyph, i in glyphs
      positions.push
        xAdvance: advances[i]
        yAdvance: 0
        xOffset: 0
        yOffset: 0
        advanceWidth: @font.widthOfGlyph glyph
      
    return [encoded, positions]

  widthOfString: (string, size) ->
    glyphs = @font.glyphsForString '' + string
    advances = @font.advancesForGlyphs glyphs
    
    width = 0
    for advance in advances
      width += advance
    
    scale = size / 1000  
    return width * scale

  @isStandardFont: (name) ->
    return name of STANDARD_FONTS

  STANDARD_FONTS =
    "Courier":               require './data/Courier.json'
    "Courier-Bold":          require './data/Courier-Bold.json'
    "Courier-Oblique":       require './data/Courier-Oblique.json'
    "Courier-BoldOblique":   require './data/Courier-BoldOblique.json'
    "Helvetica":             require './data/Helvetica.json'
    "Helvetica-Bold":        require './data/Helvetica-Bold.json'
    "Helvetica-Oblique":     require './data/Helvetica-Oblique.json'
    "Helvetica-BoldOblique": require './data/Helvetica-BoldOblique.json'
    "Times-Roman":           require './data/Times-Roman.json'
    "Times-Bold":            require './data/Times-Bold.json'
    "Times-Italic":          require './data/Times-Italic.json'
    "Times-BoldItalic":      require './data/Times-BoldItalic.json'
    "Symbol":                require './data/Symbol.json'
    "ZapfDingbats":          require './data/ZapfDingbats.json'

module.exports = StandardFont
