CmapTable = require './tables/cmap'
MacRoman = require './macroman'
utils = require './utils'

class Subset
    constructor: (@font) ->
        @subset = {}
        
    use: (character) ->
        # if given a string, add each character
        if typeof character is 'string'
            for i in [0...character.length]
                @use character.charCodeAt(i)
        else
            @subset[MacRoman.FROM_UNICODE[character]] = character
        
    encodeText: (text) ->
        string = ''
        for i in [0...text.length]
            char = MacRoman.FROM_UNICODE[text.charCodeAt(i)]
            string += String.fromCharCode(char)
            
        return string
        
    cmap: ->
        # generate the cmap table for this subset
        unicodeCmap = @font.cmap.unicode.codeMap
        mapping = {}
        for roman, unicode of @subset
            mapping[roman] = unicodeCmap[unicode]
        
        return mapping
        
    glyphIDs: ->
        # collect glyph ids for this subset
        unicodeCmap = @font.cmap.unicode.codeMap
        ret = [0]
        for roman, unicode of @subset
            val = unicodeCmap[unicode]
            ret.push val if val? and val not in ret
        
        return ret.sort()
        
    glyphsFor: (glyphIDs) ->
        # collect the actual glyph data for this subset
        glyphs = {}
        for id in glyphIDs
            glyphs[id] = @font.glyf.glyphFor(id)
        
        # collect additional glyphs referenced from compound glyphs    
        additionalIDs = []
        for id, glyph of glyphs when glyph?.compound
            additionalIDs.push glyph.glyphIDs...
            
        if additionalIDs.length > 0
            for id, glyph of @glyphsFor(additionalIDs)
                glyphs[id] = glyph
        
        return glyphs
        
    encode: ->
        # generate the Cmap for this subset
        cmap = CmapTable.encode @cmap()
        glyphs = @glyphsFor @glyphIDs()
                
        # compute old2new and new2old mapping tables
        old2new = { 0: 0 }
        for code, ids of cmap.charMap
            old2new[ids.old] = ids.new
            
        nextGlyphID = cmap.maxGlyphID
        for oldID of glyphs when oldID not of old2new
            old2new[oldID] = nextGlyphID++
            
        new2old = utils.invert(old2new)
        newIDs = Object.keys(new2old).sort (a, b) -> a - b
        oldIDs = (new2old[id] for id in newIDs)
            
        # encode the font tables
        glyf = @font.glyf.encode(glyphs, oldIDs, old2new)
        loca = @font.loca.encode(glyf.offsets)
        name = @font.name.encode()
        
        # store for use later
        @cmap = cmap.indexes
        @postscriptName = name.postscriptName
        @charWidths = (@font.hmtx.forGlyph(id).advance for id in oldIDs)
        
        tables =
            cmap: cmap.table
            glyf: glyf.table
            loca: loca.table
            hmtx: @font.hmtx.encode(oldIDs)
            hhea: @font.hhea.encode(oldIDs)
            maxp: @font.maxp.encode(oldIDs)
            post: @font.post.encode(oldIDs)
            name: name.table
            head: @font.head.encode(loca)
        
        # just copy over the OS/2 table if it exists    
        tables['OS/2'] = @font.os2.raw() if @font.os2.exists
        
        # encode the font directory
        @font.directory.encode(tables)
        
module.exports = Subset