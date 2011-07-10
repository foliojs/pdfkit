Table = require '../table'

class PostTable extends Table
    parse: (data) ->
        data.pos = @offset
        
        @format = data.readInt()
        @italicAngle = data.readInt()
        @underlinePosition = data.readShort()
        @underlineThickness = data.readShort()
        @isFixedPitch = data.readBool()
        @minMemType42 = data.readInt()
        @maxMemType42 = data.readInt()
        @minMemType1 = data.readInt()
        @maxMemType1 = data.readInt()
                
        ###
        switch @format
            when 0x00010000 then 
            when 0x00020000 then 
            when 0x00025000 then 
            when 0x00030000 then 
            when 0x00040000 then 
        ###
        
module.exports = PostTable