Table = require '../table'

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
                @codeMap[i] = data.readByte() for i in [0...256]
            
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
        
module.exports = CmapTable