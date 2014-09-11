fs = require 'fs'

class AFMFont
  @open: (filename) ->
    new AFMFont fs.readFileSync filename, 'utf8'
  
  constructor: (@contents) ->
    @attributes = {}
    @glyphWidths = {}
    @boundingBoxes = {}
    
    @parse()
    @charWidths = (@glyphWidths[characters[i]] for i in [0..255])
    
    @bbox = (+e for e in @attributes['FontBBox'].split /\s+/)
    @ascender = +(@attributes['Ascender'] or 0)
    @decender = +(@attributes['Descender'] or 0)
    @lineGap = (@bbox[3] - @bbox[1]) - (@ascender - @decender)
  
  parse: ->
    section = ''
    for line in @contents.split '\n'
      if match = line.match /^Start(\w+)/
        section = match[1]
        continue
        
      else if match = line.match /^End(\w+)/
        section = ''
        continue
        
      switch section
        when 'FontMetrics'
          match = line.match(/(^\w+)\s+(.*)/)
          key = match[1]
          value = match[2]
          
          if a = @attributes[key]
            a = @attributes[key] = [a] if !Array.isArray(a)
            a.push(value)
          else
            @attributes[key] = value
          
        when 'CharMetrics'
          continue unless /^CH?\s/.test(line)
          name = line.match(/\bN\s+(\.?\w+)\s*;/)[1]
          @glyphWidths[name] = +line.match(/\bWX\s+(\d+)\s*;/)[1]
          
    return
    
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
    string = ''
    for i in [0...text.length]
      char = text.charCodeAt(i)
      char = WIN_ANSI_MAP[char] or char
      string += String.fromCharCode(char)
    
    return string
          
  characterToGlyph: (character) ->
    return characters[WIN_ANSI_MAP[character] or character]
          
  widthOfGlyph: (glyph) ->
    return @glyphWidths[glyph]
                    
  characters = '''
      .notdef       .notdef        .notdef        .notdef
      .notdef       .notdef        .notdef        .notdef
      .notdef       .notdef        .notdef        .notdef
      .notdef       .notdef        .notdef        .notdef
      .notdef       .notdef        .notdef        .notdef
      .notdef       .notdef        .notdef        .notdef
      .notdef       .notdef        .notdef        .notdef
      .notdef       .notdef        .notdef        .notdef

      space         exclam         quotedbl       numbersign
      dollar        percent        ampersand      quotesingle
      parenleft     parenright     asterisk       plus
      comma         hyphen         period         slash
      zero          one            two            three
      four          five           six            seven
      eight         nine           colon          semicolon
      less          equal          greater        question

      at            A              B              C
      D             E              F              G
      H             I              J              K
      L             M              N              O
      P             Q              R              S
      T             U              V              W
      X             Y              Z              bracketleft
      backslash     bracketright   asciicircum    underscore

      grave         a              b              c
      d             e              f              g
      h             i              j              k
      l             m              n              o
      p             q              r              s
      t             u              v              w
      x             y              z              braceleft
      bar           braceright     asciitilde     .notdef

      Euro          .notdef        quotesinglbase florin
      quotedblbase  ellipsis       dagger         daggerdbl
      circumflex    perthousand    Scaron         guilsinglleft
      OE            .notdef        Zcaron         .notdef
      .notdef       quoteleft      quoteright     quotedblleft
      quotedblright bullet         endash         emdash
      tilde         trademark      scaron         guilsinglright
      oe            .notdef        zcaron         ydieresis

      space         exclamdown     cent           sterling
      currency      yen            brokenbar      section
      dieresis      copyright      ordfeminine    guillemotleft
      logicalnot    hyphen         registered     macron
      degree        plusminus      twosuperior    threesuperior
      acute         mu             paragraph      periodcentered
      cedilla       onesuperior    ordmasculine   guillemotright
      onequarter    onehalf        threequarters  questiondown

      Agrave        Aacute         Acircumflex    Atilde
      Adieresis     Aring          AE             Ccedilla
      Egrave        Eacute         Ecircumflex    Edieresis
      Igrave        Iacute         Icircumflex    Idieresis
      Eth           Ntilde         Ograve         Oacute
      Ocircumflex   Otilde         Odieresis      multiply
      Oslash        Ugrave         Uacute         Ucircumflex
      Udieresis     Yacute         Thorn          germandbls

      agrave        aacute         acircumflex    atilde
      adieresis     aring          ae             ccedilla
      egrave        eacute         ecircumflex    edieresis
      igrave        iacute         icircumflex    idieresis
      eth           ntilde         ograve         oacute
      ocircumflex   otilde         odieresis      divide
      oslash        ugrave         uacute         ucircumflex
      udieresis     yacute         thorn          ydieresis
  '''.split(/\s+/)
    
module.exports = AFMFont