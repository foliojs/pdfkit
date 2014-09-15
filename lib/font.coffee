###
PDFFont - embeds fonts in PDF documents
By Devon Govett
###

TTFFont = require './font/ttf'
AFMFont = require './font/afm'
Subset = require './font/subset'
fs = require 'fs'

class PDFFont
  constructor: (@document, src, family, @id) ->    
    if typeof src is 'string'
      if src of STANDARD_FONTS
        @isAFM = true
        @font = new AFMFont STANDARD_FONTS[src]()
        @registerAFM src
        return
      
      else if /\.(ttf|ttc)$/i.test src
        @font = TTFFont.open src, family
      
      else if /\.dfont$/i.test src
        @font = TTFFont.fromDFont src, family
        
      else
        throw new Error 'Not a supported font format or standard PDF font.'
        
    else if Buffer.isBuffer(src)
      @font = TTFFont.fromBuffer src, family

    else if src instanceof Uint8Array
      @font = TTFFont.fromBuffer new Buffer(src), family
      
    else if src instanceof ArrayBuffer
      @font = TTFFont.fromBuffer new Buffer(new Uint8Array(src)), family
      
    else
      throw new Error 'Not a supported font format or standard PDF font.'
      
    # create a subset for the font and register
    @subset = new Subset @font
    @registerTTF()
      
  # This insanity is so browserify can inline the font files
  STANDARD_FONTS =
    "Courier":               -> fs.readFileSync __dirname + "/font/data/Courier.afm", 'utf8'
    "Courier-Bold":          -> fs.readFileSync __dirname + "/font/data/Courier-Bold.afm", 'utf8'
    "Courier-Oblique":       -> fs.readFileSync __dirname + "/font/data/Courier-Oblique.afm", 'utf8'
    "Courier-BoldOblique":   -> fs.readFileSync __dirname + "/font/data/Courier-BoldOblique.afm", 'utf8'
    "Helvetica":             -> fs.readFileSync __dirname + "/font/data/Helvetica.afm", 'utf8'
    "Helvetica-Bold":        -> fs.readFileSync __dirname + "/font/data/Helvetica-Bold.afm", 'utf8'
    "Helvetica-Oblique":     -> fs.readFileSync __dirname + "/font/data/Helvetica-Oblique.afm", 'utf8'
    "Helvetica-BoldOblique": -> fs.readFileSync __dirname + "/font/data/Helvetica-BoldOblique.afm", 'utf8'
    "Times-Roman":           -> fs.readFileSync __dirname + "/font/data/Times-Roman.afm", 'utf8'
    "Times-Bold":            -> fs.readFileSync __dirname + "/font/data/Times-Bold.afm", 'utf8'
    "Times-Italic":          -> fs.readFileSync __dirname + "/font/data/Times-Italic.afm", 'utf8'
    "Times-BoldItalic":      -> fs.readFileSync __dirname + "/font/data/Times-BoldItalic.afm", 'utf8'
    "Symbol":                -> fs.readFileSync __dirname + "/font/data/Symbol.afm", 'utf8'
    "ZapfDingbats":          -> fs.readFileSync __dirname + "/font/data/ZapfDingbats.afm", 'utf8'
      
  use: (characters) ->
    @subset?.use characters
    
  embed: ->
    return if @embedded or not @dictionary?
    
    if @isAFM
      @embedAFM()
    else
      @embedTTF()
      
    @embedded = true
    
  encode: (text) ->
    if @isAFM
      @font.encodeText text
    else
      @subset?.encodeText(text) or text
          
  ref: ->
    @dictionary ?= @document.ref()
    
  registerTTF: ->
    @name = @font.name.postscriptName
    @scaleFactor = 1000.0 / @font.head.unitsPerEm
    @bbox = (Math.round e * @scaleFactor for e in @font.bbox)
    @stemV = 0 # not sure how to compute this for true-type fonts...
    
    if @font.post.exists
      raw = @font.post.italic_angle
      hi = raw >> 16
      low = raw & 0xFF
      hi = -((hi ^ 0xFFFF) + 1) if hi & 0x8000 isnt 0
      @italicAngle = +"#{hi}.#{low}"
    else
      @italicAngle = 0
      
    @ascender = Math.round @font.ascender * @scaleFactor
    @decender = Math.round @font.decender * @scaleFactor
    @lineGap = Math.round @font.lineGap * @scaleFactor

    @capHeight = (@font.os2.exists and @font.os2.capHeight) or @ascender
    @xHeight = (@font.os2.exists and @font.os2.xHeight) or 0

    @familyClass = (@font.os2.exists and @font.os2.familyClass or 0) >> 8
    @isSerif = @familyClass in [1,2,3,4,5,7]
    @isScript = @familyClass is 10

    @flags = 0
    @flags |= 1 << 0 if @font.post.isFixedPitch
    @flags |= 1 << 1 if @isSerif
    @flags |= 1 << 3 if @isScript
    @flags |= 1 << 6 if @italicAngle isnt 0
    @flags |= 1 << 5 # assume the font is nonsymbolic...

    throw new Error 'No unicode cmap for font' if not @font.cmap.unicode
      
  embedTTF: ->
    data = @subset.encode()
    fontfile = @document.ref()
    fontfile.write data
    
    fontfile.data.Length1 = fontfile.uncompressedLength
    fontfile.end()
      
    descriptor = @document.ref
      Type: 'FontDescriptor'
      FontName: @subset.postscriptName
      FontFile2: fontfile
      FontBBox: @bbox
      Flags: @flags
      StemV: @stemV
      ItalicAngle: @italicAngle
      Ascent: @ascender
      Descent: @decender
      CapHeight: @capHeight
      XHeight: @xHeight
      
    descriptor.end()
      
    firstChar = +Object.keys(@subset.cmap)[0]
    charWidths = for code, glyph of @subset.cmap
      Math.round @font.widthOfGlyph(glyph)
  
    cmap = @document.ref()
    cmap.end toUnicodeCmap(@subset.subset)
    
    @dictionary.data =
      Type: 'Font'
      BaseFont: @subset.postscriptName
      Subtype: 'TrueType'
      FontDescriptor: descriptor
      FirstChar: firstChar
      LastChar: firstChar + charWidths.length - 1
      Widths: charWidths
      Encoding: 'MacRomanEncoding'
      ToUnicode: cmap
    
    @dictionary.end()
      
  toUnicodeCmap = (map) ->
    unicodeMap = '''
      /CIDInit /ProcSet findresource begin
      12 dict begin
      begincmap
      /CIDSystemInfo <<
        /Registry (Adobe)
        /Ordering (UCS)
        /Supplement 0
      >> def
      /CMapName /Adobe-Identity-UCS def
      /CMapType 2 def
      1 begincodespacerange
      <00><ff>
      endcodespacerange
    '''
  
    codes = Object.keys(map).sort (a, b) -> a - b
    range = []
    for code in codes
      if range.length >= 100
        unicodeMap += "\n#{range.length} beginbfchar\n#{range.join('\n')}\nendbfchar"
        range = []
        
      unicode = ('0000' + map[code].toString(16)).slice(-4)
      code = (+code).toString(16)
      range.push "<#{code}><#{unicode}>"
      
    unicodeMap += "\n#{range.length} beginbfchar\n#{range.join('\n')}\nendbfchar\n" if range.length
    unicodeMap += '''
      endcmap
      CMapName currentdict /CMap defineresource pop
      end
      end
    '''
          
  registerAFM: (@name) ->
    {@ascender,@decender,@bbox,@lineGap} = @font
    
  embedAFM: ->
    @dictionary.data =
      Type: 'Font'
      BaseFont: @name
      Subtype: 'Type1'
      Encoding: 'WinAnsiEncoding'
      
    @dictionary.end()
      
  widthOfString: (string, size) ->
    string = '' + string
    width = 0
    for i in [0...string.length]
      charCode = string.charCodeAt(i)        
      width += @font.widthOfGlyph(@font.characterToGlyph(charCode)) or 0
    
    scale = size / 1000  
    return width * scale
    
  lineHeight: (size, includeGap = false) ->
    gap = if includeGap then @lineGap else 0
    (@ascender + gap - @decender) / 1000 * size
    
module.exports = PDFFont
