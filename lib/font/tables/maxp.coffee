Table = require '../table'
Data = require '../../data'

class MaxpTable extends Table
    parse: (data) ->
        data.pos = @offset
        
        @version = data.readInt()
        @numGlyphs = data.readUInt16()
        @maxPoints = data.readUInt16()
        @maxContours = data.readUInt16()
        @maxCompositePoints = data.readUInt16()
        @maxComponentContours = data.readUInt16()
        @maxZones = data.readUInt16()
        @maxTwilightPoints = data.readUInt16()
        @maxStorage = data.readUInt16()
        @maxFunctionDefs = data.readUInt16()
        @maxInstructionDefs = data.readUInt16()
        @maxStackElements = data.readUInt16()
        @maxSizeOfInstructions = data.readUInt16()
        @maxComponentElements = data.readUInt16()
        @maxComponentDepth = data.readUInt16()
        
    encode: (ids) ->
        table = new Data
        
        table.writeInt @version
        table.writeUInt16 ids.length # numGlyphs
        table.writeUInt16 @maxPoints
        table.writeUInt16 @maxContours
        table.writeUInt16 @maxCompositePoints
        table.writeUInt16 @maxComponentContours
        table.writeUInt16 @maxZones
        table.writeUInt16 @maxTwilightPoints
        table.writeUInt16 @maxStorage
        table.writeUInt16 @maxFunctionDefs
        table.writeUInt16 @maxInstructionDefs
        table.writeUInt16 @maxStackElements
        table.writeUInt16 @maxSizeOfInstructions
        table.writeUInt16 @maxComponentElements
        table.writeUInt16 @maxComponentDepth
        
        return table.data
        
module.exports = MaxpTable