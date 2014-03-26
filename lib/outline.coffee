###
PDFOutline - represents a table of contents in the PDF 1.3 document
By Alexey Voytenko
see also methods addOutline, addSublevelOutline, endOutlineSublevel
of PDFDocument class
###

PDFObject = require './object'
PDFPage   = require './page'

class PDFOutline
    constructor: ( @document, parent, @title, @dest, @options = {} ) ->

        @type    = @options.type or 'XYZ'
        @unicode = @options.unicode or false

        # to convert library y coordinate to requred user space coordinate
        height = @document.page.height

        # see PDFReference 1.3, 7.2.1 Destinations
        switch @type  
            when 'Fit', 'FitB'
                destination = [@dest.dictionary, @type]

            when 'FitH', 'FitBH'
                top = height - ( @options.top or 0 )
                destination = [@dest.dictionary, @type, top]

            when 'FitV', 'FitBV'
                top = height - ( @options.left or 0 )
                destination = [@dest.dictionary, @type, left]

            when 'FitR'
                left   = @options.left or 0
                bottom = height - ( @options.bottom or 0 )
                right  = @options.right or 0
                top    = height - ( @options.top or 0 )
                destination = [@dest.dictionary, @type, left, bottom, right, top]

            else  # assuming 'XYZ' - most common
                # XY - coordinates of page top left in user space system,
                # Z  - zoom factor (null for X,Y,Z - previous value unchanged)
                X = @options.X or 0
                Y = height - ( @options.Y or @document.y )
                Z = @options.Z or null
                destination = [@dest.dictionary, @type, X, Y, Z]

        # The outline dictionary
        @dictionary = @document.ref
            Title:  PDFObject.s @title, @unicode  # need to specify if unicode
            Parent: parent      # dictionary
            Dest:   destination

module.exports = PDFOutline
