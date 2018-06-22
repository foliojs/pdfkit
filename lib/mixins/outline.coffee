PDFOutline = require '../outline'

module.exports =
    initOutline: () ->
        @outline = new PDFOutline(this, null, null, null)

    endOutline: () ->
        @outline.endOutline()
        if @outline.children.length > 0
            @_root.data.Outlines = @outline.dictionary
            @_root.data.PageMode = 'UseOutlines'
