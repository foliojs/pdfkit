###
PDFOutline - represents a table of contents in the PDF 1.3 document
By Alex
###

PDFObject = require './object'
PDFPage   = require './page'

class PDFOutline
    constructor: ( @document, @title, @dest, @unicode ) ->

        @length  = @document.outlines.length

        # XY - coordinates of page top left in user space system,
        # Z  - zoom factor (null for X,Y,Z - value unchanged)
        y = @document.page.height - @document.y
        destination = [@dest.dictionary, 'XYZ', 0, y, null]

        # The outline dictionary - link to the objects in the document
        if @length == 0
            @dictionary = @document.ref
                Title:  PDFObject.s @title, @unicode
                Parent: @document.store.outlines
                Dest:   destination
        else
            @dictionary = @document.ref
                Title:  PDFObject.s @title, @unicode
                Parent: @document.store.outlines
                Prev:   @document.outlines[@length-1].dictionary
                Dest:   destination

        #todo: a link to the nested outline sublevel

module.exports = PDFOutline
