class Directory
    constructor: (data) ->
        @scalarType = data.readInt()
        @tableCount = data.readShort()
        @searchRange = data.readShort()
        @entrySelector = data.readShort()
        @rangeShift = data.readShort()
        
        @tables = {}
        for i in [0...@tableCount]
            entry =
                tag: data.readString(4)
                checksum: data.readInt()
                offset: data.readInt()
                length: data.readInt()
              
            @tables[entry.tag] = entry
                    
module.exports = Directory