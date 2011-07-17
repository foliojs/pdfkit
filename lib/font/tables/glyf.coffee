Table = require '../table'
Data = require '../../data'

class GlyfTable extends Table
    parse: (data) ->
        # We're not going to parse the whole glyf table, just the glyfs we need.  See below.
        @cache = {}
        
    glyphFor: (id) ->
        return @cache[id] if id of @cache
        
        loca = @file.loca
        data = @file.contents
        
        index = loca.indexOf(id)
        length = loca.lengthOf(id)
        
        if length is 0
            return @cache[id] = null
            
        data.pos = @offset + index
        raw = new Data data.read(length)
        
        numberOfContours = raw.readShort()
        xMin = raw.readShort()
        yMin = raw.readShort()
        xMax = raw.readShort()
        yMax = raw.readShort()
        
        if numberOfContours is -1
            @cache[id] = new CompoundGlyph(raw, xMin, yMin, xMax, yMax)
            
        else
            @cache[id] = new SimpleGlyph(raw, numberOfContours, xMin, yMin, xMax, yMax)
            
        return @cache[id]
        
    encode: (glyphs, mapping, old2new) ->
        table = []
        offsets = []
            
        for id in mapping
            glyph = glyphs[id]
            offsets.push table.length
            table = table.concat glyph.encode(old2new) if glyph
            
        # include an offset at the end of the table, for use in computing the
        # size of the last glyph
        offsets.push table.length
        return { table, offsets }
            
class SimpleGlyph
    constructor: (@raw, @numberOfContours, @xMin, @yMin, @xMax, @yMax) ->
        @compound = false
        
    encode: ->
        return @raw.data

# a compound glyph is one that is comprised of 2 or more simple glyphs, 
# for example a letter with an accent
class CompoundGlyph
    ARG_1_AND_2_ARE_WORDS    = 0x0001
    WE_HAVE_A_SCALE          = 0x0008
    MORE_COMPONENTS          = 0x0020
    WE_HAVE_AN_X_AND_Y_SCALE = 0x0040
    WE_HAVE_A_TWO_BY_TWO     = 0x0080
    WE_HAVE_INSTRUCTIONS     = 0x0100
    
    constructor: (@raw, @xMin, @yMin, @xMax, @yMax) ->
        @compound = true
        @glyphIDs = []
        @glyphOffsets = []
        data = @raw
                
        loop
            flags = data.readShort()
            @glyphOffsets.push data.pos
            @glyphIDs.push data.readShort()
            
            break unless flags & MORE_COMPONENTS
            
            if flags & ARG_1_AND_2_ARE_WORDS
                data.pos += 4
            else 
                data.pos += 2
                
            if flags & WE_HAVE_A_TWO_BY_TWO
                data.pos += 8
            else if flags & WE_HAVE_AN_X_AND_Y_SCALE
                data.pos += 4
            else if flags & WE_HAVE_A_SCALE
                data.pos += 2
                
    encode: (mapping) ->
        result = new Data [@raw.data...]
        
        # update glyph offsets
        for id, i in @glyphIDs
            result.pos = @glyphOffsets[i]
            result.writeShort mapping[id]
        
        return result.data
                
module.exports = GlyfTable