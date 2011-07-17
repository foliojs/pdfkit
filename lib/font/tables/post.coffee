Table = require '../table'
Data = require '../../data'

class PostTable extends Table
    parse: (data) ->
        data.pos = @offset
        
        @format = data.readInt()
        @italicAngle = data.readInt()
        @underlinePosition = data.readShort()
        @underlineThickness = data.readShort()
        @isFixedPitch = data.readInt()
        @minMemType42 = data.readInt()
        @maxMemType42 = data.readInt()
        @minMemType1 = data.readInt()
        @maxMemType1 = data.readInt()
                
        switch @format
            when 0x00010000 then break
            when 0x00020000
                numberOfGlyphs = data.readUInt16()
                @glyphNameIndex = []
                
                for i in [0...numberOfGlyphs]
                    @glyphNameIndex.push data.readUInt16()
                    
                @names = []
                while data.pos < @offset + @length
                    length = data.readByte()
                    @names.push data.readString(length)
                
            when 0x00025000
                numberOfGlyphs = data.readUInt16()
                @offsets = data.read(numberOfGlyphs)
                
            when 0x00030000 then break
            when 0x00040000
                @map = (data.readUInt32() for i in [0...@file.maxp.numGlyphs])
                
    glyphFor: (code) ->
        switch @format
            when 0x00010000
                POSTSCRIPT_GLYPHS[code] or '.notdef'
                
            when 0x00020000
                index = @glyphNameIndex[code]
                if index <= 257
                    POSTSCRIPT_GLYPHS[index]
                else
                    @names[index - 258] or '.notdef'
                    
            when 0x00025000
                POSTSCRIPT_GLYPHS[code + @offsets[code]] or '.notdef'
                
            when 0x00030000
                '.notdef'
                
            when 0x00040000
                @map[code] or 0xFFFF
        
    encode: (mapping) ->
        return null unless @exists
        
        raw = @raw()
        return raw if @format is 0x00030000
        
        table = new Data raw[0...32]
        table.writeUInt32 0x00020000 # set format
        table.pos = 32
        
        indexes = []
        strings = []
        
        for id in mapping
            post = @glyphFor id
            position = POSTSCRIPT_GLYPHS.indexOf post
            
            if position isnt -1
                indexes.push position
            else
                indexes.push 257 + strings.length
                strings.push post
                
        table.writeUInt16 Object.keys(mapping).length
        for index in indexes
            table.writeUInt16 index
        
        for string in strings
            table.writeByte string.length
            table.writeString string
        
        return table.data
        
    POSTSCRIPT_GLYPHS = '''
    .notdef .null nonmarkingreturn space exclam quotedbl numbersign dollar percent
    ampersand quotesingle parenleft parenright asterisk plus comma hyphen period slash
    zero one two three four five six seven eight nine colon semicolon less equal greater
    question at A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
    bracketleft backslash bracketright asciicircum underscore grave
    a b c d e f g h i j k l m n o p q r s t u v w x y z
    braceleft bar braceright asciitilde Adieresis Aring Ccedilla Eacute Ntilde Odieresis
    Udieresis aacute agrave acircumflex adieresis atilde aring ccedilla eacute egrave
    ecircumflex edieresis iacute igrave icircumflex idieresis ntilde oacute ograve
    ocircumflex odieresis otilde uacute ugrave ucircumflex udieresis dagger degree cent
    sterling section bullet paragraph germandbls registered copyright trademark acute
    dieresis notequal AE Oslash infinity plusminus lessequal greaterequal yen mu
    partialdiff summation product pi integral ordfeminine ordmasculine Omega ae oslash
    questiondown exclamdown logicalnot radical florin approxequal Delta guillemotleft
    guillemotright ellipsis nonbreakingspace Agrave Atilde Otilde OE oe endash emdash
    quotedblleft quotedblright quoteleft quoteright divide lozenge ydieresis Ydieresis
    fraction currency guilsinglleft guilsinglright fi fl daggerdbl periodcentered
    quotesinglbase quotedblbase perthousand Acircumflex Ecircumflex Aacute Edieresis
    Egrave Iacute Icircumflex Idieresis Igrave Oacute Ocircumflex apple Ograve Uacute
    Ucircumflex Ugrave dotlessi circumflex tilde macron breve dotaccent ring cedilla
    hungarumlaut ogonek caron Lslash lslash Scaron scaron Zcaron zcaron brokenbar Eth
    eth Yacute yacute Thorn thorn minus multiply onesuperior twosuperior threesuperior
    onehalf onequarter threequarters franc Gbreve gbreve Idotaccent Scedilla scedilla
    Cacute cacute Ccaron ccaron dcroat
    '''.split(/\s+/g)
        
module.exports = PostTable