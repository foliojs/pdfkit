###
PDFNameTree - represents a name tree object
By Devon Govett
###

class PDFNameTree

  constructor: ->
    @_items = {}

  add: (key, val) ->
    @_items[key] = val

  get: (key) ->
    @_items[key]  

  toString: ->
    # Needs to be sorted by key
    sortedKeys = (Object.keys @_items).sort (a, b) -> a.localeCompare(b)
    
    out = ['<<']
    if sortedKeys.length > 1
      [first, ..., last] = sortedKeys
      out.push '  /Limits ' + PDFObject.convert([new String(first), new String(last)])
    out.push '  /Names ['
    for key in sortedKeys
      out.push '    ' + PDFObject.convert(new String key) + ' ' + PDFObject.convert(@_items[key])
    out.push ']'
    out.push '>>'
    out.join '\n'

module.exports = PDFNameTree
PDFObject = require './object'
