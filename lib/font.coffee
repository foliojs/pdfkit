###
PDFFont - embeds fonts in PDF documents
By Devon Govett
###

TTF = require './font/ttf'
AFMFont = require './font/afm'
TTFFont = require 'fontkit'
TTFSubset = require 'fontkit/src/TTFSubset'
PDFObject = require './object'
fs = require 'fs'

class PDFFont
  constructor: (@document, src, family, @id) ->    
    if typeof src is 'string'
      if src of STANDARD_FONTS
        @isAFM = true
        @font = new AFMFont STANDARD_FONTS[src]()
        @registerAFM src
      
      else if /\.(ttf|ttc)$/i.test src
        @font = TTFFont.open src, family
        @subset = @font.createSubset()
        @unicode = [[0]]
        @widths = [@font.widthOfGlyph 0]
        @registerTTF()
      
      # else if /\.dfont$/i.test src
      #   @font = TTFFont.fromDFont src, family
      #   @subset = new TTFSubset @font
      #   @registerTTF()
        
      else
        throw new Error 'Not a supported font format or standard PDF font.'
        
    else if Buffer.isBuffer(src)
      @font = TTFFont.fromBuffer src, family
      @subset = @font.createSubset()
      @unicode = [[0]]
      @widths = [@font.widthOfGlyph 0]
      @registerTTF()
      
    else
      throw new Error 'Not a supported font format or standard PDF font.'
      
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
      glyphs = @font.glyphsForString text
      buffer = new Buffer(glyphs.length * 2)
      
      for glyph, i in glyphs
        gid = @subset.includeGlyph glyph.id
        @widths[gid] ?= @font.widthOfGlyph glyph.id
        @unicode[gid] ?= glyph.codePoints
        buffer.writeUInt16BE gid, i * 2
        
      return buffer.toString('hex')
          
  ref: ->
    @dictionary ?= @document.ref()
    
  registerTTF: ->
    @name = @font.postscriptName
    @ascender = @font.ascent
    @decender = @font.descent
    @lineGap = @font.lineGap
    @bbox = @font.bbox
      
  embedTTF: ->
    fontFile = @document.ref()
    @subset.encodeStream(fontFile)
      
    familyClass = (@font['OS/2']?.sFamilyClass or 0) >> 8
    flags = 0
    flags |= 1 << 0 if @font.post.isFixedPitch
    flags |= 1 << 1 if 1 <= familyClass <= 7
    flags |= 1 << 2 # assume the font uses non-latin characters
    flags |= 1 << 3 if familyClass is 10
    flags |= 1 << 6 if @font.head.macStyle.italic
    
    # generate a random tag (6 uppercase letters. 65 is the char code for 'A')
    tag = (String.fromCharCode Math.random() * 26 + 65 for i in [0...6]).join ''
    name = tag + '+' + @font.postscriptName
    
    descriptor = @document.ref
      Type: 'FontDescriptor'
      FontName: name
      Flags: flags
      FontBBox: @font.bbox
      ItalicAngle: @font.italicAngle
      Ascent: @font.ascent
      Descent: @font.descent
      CapHeight: @font.capHeight or @font.ascent
      XHeight: @font.xHeight or 0
      StemV: 0 # not sure how to calculate this
      FontFile2: fontFile
      
    descriptor.end()
    
    descendantFont = @document.ref
      Type: 'Font'
      Subtype: 'CIDFontType2'
      BaseFont: name
      CIDSystemInfo:
        Registry: PDFObject.s 'Adobe'
        Ordering: PDFObject.s 'Identity'
        Supplement: 0
      FontDescriptor: descriptor
      W: [0, @widths]
      
    descendantFont.end()
          
    @dictionary.data =
      Type: 'Font'
      Subtype: 'Type0'
      BaseFont: name
      Encoding: 'Identity-H'
      DescendantFonts: [descendantFont]
      ToUnicode: @toUnicodeCmap @document
      
    @dictionary.end()
        
  toHex = (codePoints...) ->
    codes = for code in codePoints
      ('0000' + code.toString(16)).slice(-4)
        
    return codes.join ''
      
  # Maps the glyph ids encoded in the PDF back to unicode strings
  # Because of ligature substitutions and the like, there may be one or more
  # unicode characters represented by each glyph.
  toUnicodeCmap: (doc) ->
    cmap = @document.ref()
    
    entries = []    
    for codePoints in @unicode
      encoded = []
      
      # encode codePoints to utf16
      for value in codePoints
        if value > 0xffff
          value -= 0x10000
          encoded.push toHex value >>> 10 & 0x3ff | 0xd800
          value = 0xdc00 | value & 0x3ff
        
        encoded.push toHex value
        
      entries.push "<#{encoded.join ' '}>"
    
    cmap.end """
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
      <0000><ffff>
      endcodespacerange
      1 beginbfrange
      <0000> <#{toHex entries.length - 1}> [#{entries.join ' '}]
      endbfrange
      endcmap
      CMapName currentdict /CMap defineresource pop
      end
      end
    """
    
    return cmap
                  
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
    if @isAFM
      string = '' + string
      width = 0
      for i in [0...string.length]
        charCode = string.charCodeAt(i)        
        width += @font.widthOfGlyph(@font.characterToGlyph(charCode)) or 0
 
      scale = size / 1000  
      return width * scale
      
    glyphs = @font.glyphsForString '' + string
    advances = @font.advancesForGlyphs glyphs
    
    width = 0
    for advance in advances
      width += advance
    
    scale = size / 1000  
    return width * scale
    
  lineHeight: (size, includeGap = false) ->
    gap = if includeGap then @lineGap else 0
    (@ascender + gap - @decender) / 1000 * size
    
module.exports = PDFFont
