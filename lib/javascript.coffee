###
PDFJavaScript - Embeds Java into a PDF Document
###


class PDFJavaScript

    constructor: (@script) ->


    toString: ->
        out = ['<</Type/Action/S/JavaScript/JS <']
        for i in [0...@script.length]
            out.push @script.charCodeAt(i).toString(16)
        out.push '>>>'
        return out.join ''


module.exports = PDFJavaScript