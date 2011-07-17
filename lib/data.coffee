class Data    
    constructor: (@data = []) ->
        @pos = 0
        @length = @data.length
                
    readByte: ->
        @data[@pos++]
        
    writeByte: (byte) ->
        @data[@pos++] = byte
        
    byteAt: (index) ->
        @data[index]
        
    readBool: ->
        return !!@readByte()
        
    writeBool: (val) ->
        @writeByte if val then 1 else 0
        
    readUInt32: ->
        b1 = @readByte() << 24
        b2 = @readByte() << 16
        b3 = @readByte() << 8
        b4 = @readByte()
        b1 | b2 | b3 | b4
    
    writeUInt32: (val) ->
        @writeByte (val >>> 24) & 0xff
        @writeByte (val >> 16) & 0xff
        @writeByte (val >> 8) & 0xff
        @writeByte val & 0xff
        
    readInt32: ->
        int = @readUInt32()
        if int >= 0x80000000 then int - 0x100000000 else int
        
    writeInt32: (val) ->
        val += 0x100000000 if val < 0
        @writeUInt32 val
        
    readUInt16: ->
        b1 = @readByte() << 8
        b2 = @readByte()
        b1 | b2
        
    writeUInt16: (val) ->
        @writeByte (val >> 8) & 0xff
        @writeByte val & 0xff
        
    readInt16: ->
        int = @readUInt16()
        if int >= 0x8000 then int - 0x10000 else int
        
    writeInt16: (val) ->
        val += 0x10000 if val < 0
        @writeUInt16 val
        
    readString: (length) ->
        ret = []
        for i in [0...length]
            ret[i] = String.fromCharCode @readByte()
            
        return ret.join ''
        
    writeString: (val) ->
        for i in [0...val.length]
            @writeByte val.charCodeAt(i)
        
    stringAt: (@pos, length) ->
        @readString length
        
    readShort: ->
        @readInt16()
        
    writeShort: (val) ->
        @writeInt16 val
    
    readLongLong: ->
        b1 = @readByte()
        b2 = @readByte()
        b3 = @readByte()
        b4 = @readByte()
        b5 = @readByte()
        b6 = @readByte()
        b7 = @readByte()
        b8 = @readByte()
        
        if b1 & 0x80 # sign -> avoid overflow
            return ((b1 ^ 0xff) * 0x100000000000000 +
                    (b2 ^ 0xff) *   0x1000000000000 +
                    (b3 ^ 0xff) *     0x10000000000 +
                    (b4 ^ 0xff) *       0x100000000 +
                    (b5 ^ 0xff) *         0x1000000 +
                    (b6 ^ 0xff) *           0x10000 +
                    (b7 ^ 0xff) *             0x100 +
                    (b8 ^ 0xff) + 1) * -1
                    
        return b1 * 0x100000000000000 +
               b2 *   0x1000000000000 +
               b3 *     0x10000000000 +
               b4 *       0x100000000 +
               b5 *         0x1000000 +
               b6 *           0x10000 +
               b7 *             0x100 +
               b8
        
    writeLongLong: (val) ->
        high = Math.floor(val / 0x100000000)
        low = val & 0xffffffff
        @writeByte (high >> 24) & 0xff
        @writeByte (high >> 16) & 0xff
        @writeByte (high >> 8) & 0xff
        @writeByte high & 0xff
        @writeByte (low >> 24) & 0xff
        @writeByte (low >> 16) & 0xff
        @writeByte (low >> 8) & 0xff
        @writeByte low & 0xff
        
    readInt: ->
        @readInt32()
        
    writeInt: (val) ->
        @writeInt32 val
        
    slice: (start, end) ->
        @data.slice start, end
        
    read: (bytes) ->
        buf = []
        for i in [0...bytes]
            buf.push @readByte()
            
        return buf
        
    write: (bytes) ->
        for byte in bytes
            @writeByte byte
        
module.exports = Data