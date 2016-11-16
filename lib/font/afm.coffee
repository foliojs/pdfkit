class AFMFont

  constructor: (@contents) ->
    @attributes = @contents.attributes
    @glyphWidths = @contents.glyphWidths
    @kerning = @contents.kerning
    @glyphGroups = @contents.glyphGroups

    @bbox = (+e for e in @attributes['FontBBox'].split /\s+/)
    @ascender = +(@attributes['Ascender'] or @bbox[3] or 0)
    @descender = +(@attributes['Descender'] or @bbox[1] or 0)
    @xHeight = +(@attributes['XHeight'] or 0)
    @capHeight = +(@attributes['CapHeight'] or 0)
    @lineGap = (@bbox[3] - @bbox[1]) - (@ascender - @descender)

  WIN_ANSI_MAP =
    402:  131
    8211: 150
    8212: 151
    8216: 145
    8217: 146
    8218: 130
    8220: 147
    8221: 148
    8222: 132
    8224: 134
    8225: 135
    8226: 149
    8230: 133
    8364: 128
    8240: 137
    8249: 139
    8250: 155
    710:  136
    8482: 153
    338:  140
    339:  156
    732:  152
    352:  138
    353:  154
    376:  159
    381:  142
    382:  158

  encodeText: (text) ->
    res = []
    for i in [0...text.length]
      char = text.charCodeAt(i)
      char = WIN_ANSI_MAP[char] or char
      res.push char.toString(16)
    
    return res

  glyphsForString: (string) ->
    glyphs = []
    
    for i in [0...string.length]
      charCode = string.charCodeAt(i)        
      glyphs.push @characterToGlyph charCode
      
    return glyphs

  characterToGlyph: (character) ->
    return WIN_ANSI_MAP[character] or character or 0

  widthOfGlyph: (glyph) ->
    return @glyphWidths[glyph] or 0

  getKernPair: (left, right) ->
    return @kerning[@glyphGroups[left] + ' ' + @glyphGroups[right]] or 0

  advancesForGlyphs: (glyphs) ->
    advances = []
    
    for left, index in glyphs
      right = glyphs[index + 1]
      advances.push @widthOfGlyph(left) + @getKernPair(left, right)
      
    return advances

module.exports = AFMFont
