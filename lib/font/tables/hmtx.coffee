Table = require '../table'
Data = require '../../data'

class HmtxTable extends Table
    parse: (data) ->
        data.pos = @offset
        
        @metrics = []
        for i in [0...@file.hhea.numberOfMetrics]
            @metrics.push
                advance: data.readUInt16()
                lsb: data.readInt16()
                
        lsbCount = @file.maxp.numGlyphs - @file.hhea.numberOfMetrics
        @leftSideBearings = (data.readInt16() for i in [0...lsbCount])
        
        @widths = (m.advance for m in @metrics)
        last = @widths[@widths.length - 1]
        @widths.push(last) for i in [0...lsbCount]
        
    forGlyph: (id) ->
        return @metrics[id] if id of @metrics
        metrics = 
            advance: @metrics[@metrics.length - 1].advance
            lsb: @leftSideBearings[id - @metrics.length]
        
    encode: (mapping) ->
        table = new Data
        for id in mapping
            metric = @forGlyph id
            table.writeUInt16 metric.advance
            table.writeUInt16 metric.lsb
            
        return table.data
        
             
module.exports = HmtxTable