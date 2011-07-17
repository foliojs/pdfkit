Table = require '../table'
Data = require '../../data'

class CmapTable extends Table
    parse: (data) ->
        data.pos = @offset
        
        @version = data.readUInt16()
        tableCount = data.readUInt16()
        @tables = []
        @unicode = null
        
        for i in [0...tableCount]
            entry = new CmapEntry(data, @offset)
            @tables.push entry
            @unicode ?= entry if entry.isUnicode
            
        return true
        
    @encode: (charmap, encoding = 0) ->
        result = CmapEntry.encode(charmap, encoding)
        table = new Data
        
        table.writeUInt16 0 # version
        table.writeUInt16 1 # tableCount
        
        result.table = table.data.concat(result.subtable)
        return result
            
class CmapEntry
    constructor: (data, offset) ->
        @platformID = data.readUInt16()
        @encodingID = data.readShort()
        @offset = offset + data.readInt()
        
        data.pos = @offset
        @format = data.readUInt16()
        @length = data.readUInt16()
        @language = data.readUInt16()
        
        @isUnicode = (@platformID is 3 and @encodingID is 1 and @format is 4) or @platformID is 0 and @format is 4
        
        @codeMap = {}
        switch @format
            when 0
                for i in [0...256]
                    @codeMap[i] = data.readByte()
            
            when 4
                segCountX2 = data.readUInt16()
                segCount = segCountX2 / 2
                
                data.pos += 6 # skip searching hints
                endCode = (data.readUInt16() for i in [0...segCount])
                data.pos += 2 # skip reserved value
                
                startCode = (data.readUInt16() for i in [0...segCount])
                idDelta = (data.readUInt16() for i in [0...segCount])
                idRangeOffset = (data.readUInt16() for i in [0...segCount])
                
                count = @length - data.pos + @offset
                glyphIds = (data.readUInt16() for i in [0...count])
                
                for tail, i in endCode
                    start = startCode[i]
                    for code in [start..tail]
                        if idRangeOffset[i] is 0
                            glyphId = code + idDelta[i]
                        else
                            index = idRangeOffset[i] / 2 + (code - start) - (segCount - i)
                            glyphId = glyphIds[index] or 0
                            glyphId += idDelta[i] if glyphId isnt 0
                            
                        @codeMap[code] = glyphId & 0xFFFF
                        
    @encode: (charmap, format) ->
        subtable = new Data
        switch format
            when 0 # Mac Roman
                id = 0
                indexes = (0 for i in [0...256])
                map = { 0: 0 }
                codeMap = {}
                
                for code in Object.keys(charmap).sort()
                    map[charmap[code]] ?= ++id
                    codeMap[code] = 
                        old: charmap[code]
                        new: map[charmap[code]]
                        
                    indexes[code] = map[charmap[code]]
                    
                subtable.writeUInt16 1   # platformID
                subtable.writeUInt16 0   # encodingID
                subtable.writeUInt32 12  # offset
                subtable.writeUInt16 0   # format
                subtable.writeUInt16 262 # length
                subtable.writeUInt16 0   # language
                subtable.write indexes   # glyph indexes
                
                result = 
                    charMap: codeMap
                    indexes: indexes
                    subtable: subtable.data
                    maxGlyphID: id + 1
                
            when 4 # Unicode - TODO: implement
                return
        
module.exports = CmapTable