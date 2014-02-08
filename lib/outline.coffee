###
PDFOutline - represents a table of contents in the PDF 1.3 document
By Alex
###

PDFObject = require './object'

class PDFOutline
    constructor: (@document, title, dest, options = {}) ->

        @title  = title
        @dest   = dest
        @length = @document.outlines.length

        # The outline dictionary - link to the objects in the document
        if @length == 0
            @dictionary = @document.ref
                Title:  PDFObject.s @title
                Parent: @document.store.outlines
                Dest:   [@dest.dictionary, 'XYZ', 0, 792, 0]
        else
            @dictionary = @document.ref
                Title:  PDFObject.s @title
                Parent: @document.store.outlines
                Prev:   @document.outlines[@length-1].dictionary
                Dest:   [@dest.dictionary, 'XYZ', 0, 792, 0]

        #optional: a link to the nested outline sublevel

    # seems nothing to finalize
    # finalize: (fn) ->
    #    @content.finalize(@document.compress, fn)

module.exports = PDFOutline
