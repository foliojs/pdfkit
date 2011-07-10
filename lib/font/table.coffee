class Table
    constructor: (@file) ->
        @tag ?= @constructor.name.replace('Table', '').toLowerCase()
        info = @file.directory.tables[@tag]
        @exists = !!info
        
        if info
            {@offset, @length} = info
            @parse @file.contents
            
    parse: ->
        # implemented by subclasses
            
module.exports = Table