Table = require '../table'
Data = require '../../data'

class HheaTable extends Table
    parse: (data) ->
        data.pos = @offset
        
        @version = data.readInt()
        @ascender = data.readShort()
        @decender = data.readShort()
        @lineGap = data.readShort()
        @advanceWidthMax = data.readShort()
        @minLeftSideBearing = data.readShort()
        @minRightSideBearing = data.readShort()
        @xMaxExtent = data.readShort()
        @caretSlopeRise = data.readShort()
        @caretSlopeRun = data.readShort()
        @caretOffset = data.readShort()
        
        data.pos += 4 * 2 # skip 4 reserved int16 slots
        
        @metricDataFormat = data.readShort()
        @numberOfMetrics = data.readUInt16()
        
    encode: (ids) ->
        table = new Data
        
        table.writeInt @version
        table.writeShort @ascender
        table.writeShort @decender
        table.writeShort @lineGap
        table.writeShort @advanceWidthMax
        table.writeShort @minLeftSideBearing
        table.writeShort @minRightSideBearing
        table.writeShort @xMaxExtent
        table.writeShort @caretSlopeRise
        table.writeShort @caretSlopeRun
        table.writeShort @caretOffset
        
        table.writeByte(0) for i in [0...4 * 2] # skip 4 reserved int16 slots
        
        table.writeShort @metricDataFormat
        table.writeUInt16 ids.length # numberOfMetrics
        
        return table.data
        
module.exports = HheaTable