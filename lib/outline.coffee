PDFObject = require './object'
PDFPage = require './page'

class PDFOutline
    constructor: (@document, parent, @title, @dest) ->

        destination = [@dest.dictionary, 'Fit']

        @dictionary = @document.ref
            Title: new String(@title)
            Parent: parent
            Dest: destination

module.exports = PDFOutline