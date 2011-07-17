Data = require '../data'

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
            
    encode: (tables) ->
        tableCount = Object.keys(tables).length
        log2 = Math.log(2)
        
        searchRange = Math.floor(Math.log(tableCount) / log2) * 16
        entrySelector = Math.floor searchRange / log2
        rangeShift = tableCount * 16 - searchRange
        
        directory = new Data
        directory.writeInt @scalarType
        directory.writeShort tableCount
        directory.writeShort searchRange
        directory.writeShort entrySelector
        directory.writeShort rangeShift
        
        directoryLength = tableCount * 16
        offset = directory.pos + directoryLength
        headOffset = null
        tableData = []
        
        # encode the font table directory
        for tag, table of tables
            directory.writeString tag
            directory.writeInt checksum(table)
            directory.writeInt offset
            directory.writeInt table.length
            
            tableData = tableData.concat(table)
            headOffset = offset if tag is 'head'
            offset += table.length
            
            while offset % 4
                tableData.push 0
                offset++
        
        # write the actual table data to the font
        directory.write(tableData)
        
        # calculate the font's checksum
        sum = checksum(directory.data)
        
        # set the checksum adjustment in the head table
        adjustment = 0xB1B0AFBA - sum
        directory.pos = headOffset + 8
        directory.writeUInt32 adjustment
                
        return new Buffer(directory.data)
            
    checksum = ([data...]) ->
        while data.length % 4
            data.push 0
                
        tmp = new Data(data)
        sum = 0
        for i in [0...data.length] by 4
            sum += tmp.readUInt32()
        
        return sum & 0xFFFFFFFF
                    
module.exports = Directory