fs = require 'fs'
Data = require '../data'
DFont = require './dfont'
Directory = require './directory'

NameTable = require './tables/name'
HeadTable = require './tables/head'
CmapTable = require './tables/cmap'
HmtxTable = require './tables/hmtx'
HheaTable = require './tables/hhea'
MaxpTable = require './tables/maxp'
PostTable = require './tables/post'
OS2Table  = require './tables/os2'
LocaTable = require './tables/loca'
GlyfTable = require './tables/glyf'

class TTFFont
    @open: (filename, name) ->
        contents = fs.readFileSync filename
        new TTFFont(contents, name)
        
    @fromDFont: (filename, family) ->
        dfont = DFont.open(filename)
        new TTFFont dfont.getNamedFont(family)
    
    constructor: (@rawData, name) ->
        data = @contents = new Data(rawData)
        
        if data.readString(4) is 'ttcf'
            throw new Error "Must specify a font name for TTC files." if not name
            
            # This is a TrueType Collection
            version = data.readInt()
            numFonts = data.readInt()
            offsets = []
            for i in [0...numFonts]
                offsets[i] = data.readInt()
                
            for offset, i in offsets
                data.pos = offset
                @parse()
                
                return if @name.postscriptName is name
            
            throw new Error "Font #{name} not found in TTC file."
                                
        else
            data.pos = 0
            @parse()
        
    parse: ->
        @directory = new Directory(@contents)
        @head = new HeadTable(this)
        @name = new NameTable(this)
        @cmap = new CmapTable(this)
        @hhea = new HheaTable(this)
        @maxp = new MaxpTable(this)
        @hmtx = new HmtxTable(this)
        @post = new PostTable(this)
        @os2  = new OS2Table(this)
        @loca = new LocaTable(this)
        @glyf = new GlyfTable(this)
        
        @ascender = (@os2.exists and @os2.ascender) or @hhea.ascender
        @decender = (@os2.exists and @os2.decender) or @hhea.decender
        @lineGap = (@os2.exists and @os2.lineGap) or @hhea.lineGap
        @bbox = [@head.xMin, @head.yMin, @head.xMax, @head.yMax]

module.exports = TTFFont