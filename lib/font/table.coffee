class Table
  constructor: (@file, @tag) ->
    info = @file.directory.tables[@tag]
    @exists = !!info
    
    if info
      {@offset, @length} = info
      @parse @file.contents
      
  parse: ->
    # implemented by subclasses
      
  encode: ->
    # implemented by subclasses
      
  raw: ->
    return null unless @exists
    
    @file.contents.pos = @offset
    @file.contents.read @length
      
module.exports = Table