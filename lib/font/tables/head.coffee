Table = require '../table'

class HeadTable extends Table
    parse: (data) ->
        data.pos = @offset
        
        @version = data.readInt()
        @revision = data.readInt()
        @checkSumAdjustment = data.readInt()
        @magicNumber = data.readInt()
        @flags = data.readShort()
        @unitsPerEm = data.readShort()
        @created = data.readLongLong()
        @modified = data.readLongLong()
        
        @xMin = data.readShort()
        @yMin = data.readShort()
        @xMax = data.readShort()
        @yMax = data.readShort()
        @macStyle = data.readShort()
        @lowestRecPPEM = data.readShort()
        @fontDirectionHint = data.readShort()
        @indexToLocFormat = data.readShort()
        @glyphDataFormat = data.readShort()
        
module.exports = HeadTable