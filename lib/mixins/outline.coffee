PDFOutline = require '../outline'
assert = require('assert').strict

module.exports =
    initOutline: ->
        @outline = new PDFOutline(this, null, null, null)
        @_root.data.Outlines = @outline.dictionary

    endOutline: () ->
        # @_root.data.Outlines.end()
        @outline.endOutline()
