Table = require '../table'
Data = require '../../data'

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
    
    encode: (loca) ->
        table = new Data
        
        table.writeInt @version
        table.writeInt @revision
        table.writeInt @checkSumAdjustment
        table.writeInt @magicNumber
        table.writeShort @flags
        table.writeShort @unitsPerEm
        table.writeLongLong @created
        table.writeLongLong @modified
        
        table.writeShort @xMin
        table.writeShort @yMin
        table.writeShort @xMax
        table.writeShort @yMax
        table.writeShort @macStyle
        table.writeShort @lowestRecPPEM
        table.writeShort @fontDirectionHint
        table.writeShort loca.type
        table.writeShort @glyphDataFormat
        
        return table.data
        
module.exports = HeadTable