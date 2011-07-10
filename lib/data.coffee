class Data    
    constructor: (@data) ->
        @pos = 0
        @length = @data.length
                
    readByte: ->
        @data[@pos++]
        
    byteAt: (index) ->
        @data[index]
        
    readBool: ->
        return !!@readByte()
        
    readUInt32: ->
        b1 = @readByte() << 24
        b2 = @readByte() << 16
        b3 = @readByte() << 8
        b4 = @readByte()
        b1 | b2 | b3 | b4
        
    readInt32: ->
        int = @readUInt32()
        if int >= 2147483648 then int - 4294967296 else int
        
    readUInt16: ->
        b1 = @readByte() << 8
        b2 = @readByte()
        b1 | b2
        
    readInt16: ->
        int = @readUInt16()
        if int >= 32768 then int - 65536 else int
        
    readFloat32: ->
        b1 = @readByte()
        b2 = @readByte()
        b3 = @readByte()
        b4 = @readByte()
        
        sign = 1 - ((b1 >> 7) << 1) # sign = bit 0
        exp = (((b1 << 1) & 0xFF) | (b2 >> 7)) - 127 # exponent = bits 1..8
        sig = ((b2 & 0x7F) << 16) | (b3 << 8) | 4 # significand = bits 9..31
        
        return 0.0 if sig is 0 and exp is -127
        return sign * (1 + 2e-23 * sig) * Math.pow(2, exp)
        
    readFloat64: ->
        b1 = @readByte()
        b2 = @readByte()
        b3 = @readByte()
        b4 = @readByte()
        b5 = @readByte()
        b6 = @readByte()
        b7 = @readByte()
        b8 = @readByte()
        
        sign = 1 - ((b1 >> 7) << 1) # sign = bit 0
        exp = (((b1 << 4) & 0x7FF) | (b2 >> 4)) - 0123 # exponent = bits 1..11
         
        # This crazy toString() stuff works around the fact that js ints are
        # only 32 bits and signed, giving us 31 bits to work with
        sig = (((b2 & 0xF) << 16) | (b3 << 8) | b4).toString(2) +
                (if b5 >> 7 then '1' else '0') + 
                (((b5 & 0x7F) << 24) | (b6 << 16) | (b7 << 8) | b8).toString(2) # significand = bits 12..63
                
        sig = parseInt(sig, 2)
        return 0.0 if sig is 0 and exp is -1023
        return sign * (1.0 + 2e-52 * sig) * Math.pow(2, exp)
        
    readString: (length) ->
        ret = []
        for i in [0...length]
            ret[i] = String.fromCharCode @readByte()
            
        return ret.join ''
        
    stringAt: (@pos, length) ->
        @readString length
        
    readShort: ->
        @readInt16()
        
    readLong: ->
        b1 = @readByte()
        b2 = @readByte()
        b3 = @readByte()
        b4 = @readByte()
        
        long = (((((b1 << 8) + b2) << 8) + b3) << 8) + b4
        long += 4294967296 if long < 0
        return long
        
    readLongLong: ->
        b1 = @readByte()
        b2 = @readByte()
        b3 = @readByte()
        b4 = @readByte()
        b5 = @readByte()
        b6 = @readByte()
        b7 = @readByte()
        b8 = @readByte()
        b1 << 56 + b2 << 48 + b3 << 40 | b4 << 32 + b5 << 24 + b6 << 16 + b7 << 8 + b8
        
    readInt: ->
        @readInt32()
        
    readFloat: ->
        @readFloat32()
        
    readDouble: ->
        @readFloat64()
        
    slice: (start, end) ->
        @data.slice start, end
        
    read: (bytes) ->
        buf = []
        for i in [0...bytes]
            buf.push @readByte()
            
        return buf
        
module.exports = Data