Table = require '../table'
Data = require '../../data'

class LocaTable extends Table
    parse: (data) ->
        data.pos = @offset
        format = @file.head.indexToLocFormat
        
        # short format
        if format is 0
            @offsets = (data.readUInt16() * 2 for i in [0...@length] by 2)
        
        # long format
        else
            @offsets = (data.readUInt32() for i in [0...@length] by 4)
            
    indexOf: (id) ->
        @offsets[id]
        
    lengthOf: (id) ->
        @offsets[id + 1] - @offsets[id]
        
    encode: (offsets) ->
        table = new Data
        
        # long format
        for offset in offsets when offset > 0xFFFF
            for o in @offsets
                table.writeUInt32 o
                
            return ret =
                format: 1
                table: table.data
                
        # short format
        for o in offsets
            table.writeUInt16 o / 2
            
        ret =
            format: 0
            table: table.data
                
        
module.exports = LocaTable