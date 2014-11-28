PDFFont = require '../font'
PDFObject = require '../object'

class EmbeddedFont extends PDFFont
  constructor: (@document, @font, @id) ->
    @subset = @font.createSubset()
    @unicode = [[0]]
    @widths = [@font.widthOfGlyph 0]
    
    @name = @font.postscriptName
    @ascender = @font.ascent
    @decender = @font.descent
    @lineGap = @font.lineGap
    @bbox = @font.bbox
    
  includeGlyph: (gid) ->
    return @subset.includeGlyph gid
  
  encode: (text, features) ->
    glyphs = @font.glyphsForString text, features
    advances = @font.advancesForGlyphs glyphs, features
    
    res = []
    for glyph, i in glyphs
      gid = @includeGlyph glyph.id
      res.push ('0000' + gid.toString(16)).slice(-4)
        
      @widths[gid] ?= @font.widthOfGlyph glyph.id
      @unicode[gid] ?= glyph.codePoints
      advances[i] -= @widths[gid]
      
    return [res, advances]
    
  widthOfString: (string, size, features) ->
    glyphs = @font.glyphsForString '' + string, features
    advances = @font.advancesForGlyphs glyphs, features
    
    width = 0
    for advance in advances
      width += advance
    
    scale = size / 1000  
    return width * scale
        
  embed: ->
    isCFF = @subset.cff?
    fontFile = @document.ref()
    
    if isCFF
      fontFile.data.Subtype = 'CIDFontType0C'
      
    @subset.encodeStream().pipe(fontFile)
      
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
        
    if isCFF
      descriptor.data.FontFile3 = fontFile
    else
      descriptor.data.FontFile2 = fontFile
      
    descriptor.end()
    
    descendantFont = @document.ref
      Type: 'Font'
      Subtype: if isCFF then 'CIDFontType0' else 'CIDFontType2'
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
      ToUnicode: @toUnicodeCmap()
      
    @dictionary.end()
  
  toHex = (codePoints...) ->
    codes = for code in codePoints
      ('0000' + code.toString(16)).slice(-4)
        
    return codes.join ''
      
  # Maps the glyph ids encoded in the PDF back to unicode strings
  # Because of ligature substitutions and the like, there may be one or more
  # unicode characters represented by each glyph.
  toUnicodeCmap: ->
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
  
module.exports = EmbeddedFont
