###
PDFFont - embeds fonts in PDF documents
By Devon Govett
###

TTFFont = require './font/ttf'
AFMFont = require './font/afm'
Subset = require './font/subset'
zlib = require 'zlib'

class PDFFont
    constructor: (@document, @filename, @family, @id) ->
        if @filename in @_standardFonts
            @embedStandard()
            
        else if /\.(ttf|ttc)$/i.test @filename
            @ttf = TTFFont.open @filename, @family
            @subset = new Subset @ttf
            @registerTTF()
            
        else if /\.dfont$/i.test @filename
            @ttf = TTFFont.fromDFont @filename, @family
            @subset = new Subset @ttf
            @registerTTF()
            
        else
            throw new Error 'Not a supported font format or standard PDF font.'
            
    use: (characters) ->
        @subset?.use characters
        
    embed: (fn) ->
        return fn() if @isAFM
        @embedTTF fn
        
    encode: (text) ->
        @subset?.encodeText(text) or text
        
    registerTTF: ->
        @scaleFactor = 1000.0 / @ttf.head.unitsPerEm
        @bbox = (Math.round e * @scaleFactor for e in @ttf.bbox)
        @stemV = 0 # not sure how to compute this for true-type fonts...
        
        if @ttf.post.exists
            raw = @ttf.post.italic_angle
            hi = raw >> 16
            low = raw & 0xFF
            hi = -((hi ^ 0xFFFF) + 1) if hi & 0x8000 isnt 0
            @italicAngle = +"#{hi}.#{low}"
        else
            @italicAngle = 0
            
        @ascender = Math.round @ttf.ascender * @scaleFactor
        @decender = Math.round @ttf.decender * @scaleFactor
        @lineGap = Math.round @ttf.lineGap * @scaleFactor

        @capHeight = (@ttf.os2.exists and @ttf.os2.capHeight) or @ascender
        @xHeight = (@ttf.os2.exists and @ttf.os2.xHeight) or 0

        @familyClass = (@ttf.os2.exists and @ttf.os2.familyClass or 0) >> 8
        @isSerif = @familyClass in [1,2,3,4,5,7]
        @isScript = @familyClass is 10

        @flags = 0
        @flags |= 1 << 0 if @ttf.post.isFixedPitch
        @flags |= 1 << 1 if @isSerif
        @flags |= 1 << 3 if @isScript
        @flags |= 1 << 6 if @italicAngle isnt 0
        @flags |= 1 << 5 # assume the font is nonsymbolic...

        @cmap = @ttf.cmap.unicode
        throw new Error 'No unicode cmap for font' if not @cmap

        @hmtx = @ttf.hmtx
        @charWidths = (Math.round @hmtx.widths[gid] * @scaleFactor for i, gid of @cmap.codeMap when i >= 32)
        
        # Create a placeholder reference to be filled in embedTTF.
        @ref = @document.ref
            Type: 'Font'
            Subtype: 'TrueType'
            
    embedTTF: (fn) ->
        data = @subset.encode()
        zlib.deflate data, (err, compressedData) =>
            throw err if err
        
            @fontfile = @document.ref
                Length: compressedData.length
                Length1: data.length
                Filter: 'FlateDecode'
            
            @fontfile.add compressedData
                
            @descriptor = @document.ref
                Type: 'FontDescriptor'
                FontName: @subset.postscriptName
                FontFile2: @fontfile
                FontBBox: @bbox
                Flags: @flags
                StemV: @stemV
                ItalicAngle: @italicAngle
                Ascent: @ascender
                Descent: @decender
                CapHeight: @capHeight
                XHeight: @xHeight
                
            firstChar = +Object.keys(@subset.cmap)[0]
            charWidths = for code, glyph of @subset.cmap
                Math.round @ttf.hmtx.forGlyph(glyph).advance * @scaleFactor
            
        
            cmap = @document.ref()
            cmap.add toUnicodeCmap(@subset.subset)
            
            ref = 
                Type: 'Font'
                BaseFont: @subset.postscriptName
                Subtype: 'TrueType'
                FontDescriptor: @descriptor
                FirstChar: firstChar
                LastChar: firstChar + charWidths.length - 1
                Widths: @document.ref charWidths
                Encoding: 'MacRomanEncoding'
                ToUnicode: cmap
            
            for key, val of ref
                @ref.data[key] = val
                
            cmap.finalize(@document.compress, fn) # compress it
            
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
                    
    embedStandard: ->
        @isAFM = true
        font = AFMFont.open __dirname + "/font/data/#{@filename}.afm"
        {@ascender,@decender,@bbox,@lineGap,@charWidths} = font
        
        @ref = @document.ref
            Type: 'Font'
            BaseFont: @filename
            Subtype: 'Type1'
            
    _standardFonts: [
        "Courier"
        "Courier-Bold"
        "Courier-Oblique"
        "Courier-BoldOblique"
        "Helvetica"
        "Helvetica-Bold"
        "Helvetica-Oblique"
        "Helvetica-BoldOblique"
        "Times-Roman"
        "Times-Bold"
        "Times-Italic"
        "Times-BoldItalic"
        "Symbol"
        "ZapfDingbats"
    ]
    
    widthOfString: (string, size) ->
        string = '' + string
        width = 0
        for i in [0...string.length]
            charCode = string.charCodeAt(i) - if @isAFM then 0 else 32
            width += @charWidths[charCode] or 0
        
        scale = size / 1000    
        return width * scale
        
    lineHeight: (size, includeGap = false) ->
        gap = if includeGap then @lineGap else 0
        (@ascender + gap - @decender) / 1000 * size
        
module.exports = PDFFont