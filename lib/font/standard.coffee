AFMFont = require './afm'
PDFFont = require '../font'
fs = require 'fs'

class StandardFont extends PDFFont
  constructor: (@document, @name, @id) ->
    @font = new AFMFont STANDARD_FONTS[@name]()
    {@ascender,@descender,@bbox,@lineGap} = @font

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

  # This insanity is so browserify can inline the font files
  STANDARD_FONTS =
    "Courier":               -> fs.readFileSync __dirname + "/../font/data/Courier.afm", 'utf8'
    "Courier-Bold":          -> fs.readFileSync __dirname + "/../font/data/Courier-Bold.afm", 'utf8'
    "Courier-Oblique":       -> fs.readFileSync __dirname + "/../font/data/Courier-Oblique.afm", 'utf8'
    "Courier-BoldOblique":   -> fs.readFileSync __dirname + "/../font/data/Courier-BoldOblique.afm", 'utf8'
    "Helvetica":             -> fs.readFileSync __dirname + "/../font/data/Helvetica.afm", 'utf8'
    "Helvetica-Bold":        -> fs.readFileSync __dirname + "/../font/data/Helvetica-Bold.afm", 'utf8'
    "Helvetica-Oblique":     -> fs.readFileSync __dirname + "/../font/data/Helvetica-Oblique.afm", 'utf8'
    "Helvetica-BoldOblique": -> fs.readFileSync __dirname + "/../font/data/Helvetica-BoldOblique.afm", 'utf8'
    "Times-Roman":           -> fs.readFileSync __dirname + "/../font/data/Times-Roman.afm", 'utf8'
    "Times-Bold":            -> fs.readFileSync __dirname + "/../font/data/Times-Bold.afm", 'utf8'
    "Times-Italic":          -> fs.readFileSync __dirname + "/../font/data/Times-Italic.afm", 'utf8'
    "Times-BoldItalic":      -> fs.readFileSync __dirname + "/../font/data/Times-BoldItalic.afm", 'utf8'
    "Symbol":                -> fs.readFileSync __dirname + "/../font/data/Symbol.afm", 'utf8'
    "ZapfDingbats":          -> fs.readFileSync __dirname + "/../font/data/ZapfDingbats.afm", 'utf8'

module.exports = StandardFont
