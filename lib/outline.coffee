PDFObject = require './object'
PDFPage = require './page'

class PDFOutline
    constructor: (@document, parent, title, dest, @options = { expanded: false }) ->

        @outlineData = {}

        if dest != null
            @outlineData['Dest'] = [dest.dictionary, 'Fit']

        if parent != null
            @outlineData['Parent'] = parent

        if title != null
            @outlineData['Title'] = new String(title)

        @dictionary = @document.ref @outlineData
        @children = []

    addItem: (title, options = { expanded: false }) ->
        result = new PDFOutline(@document, @dictionary, title, @document.page, options)
        @children.push(result)

        return result

    endOutline: () ->
        if @children.length > 0
            if @options.expanded
                @outlineData.Count = @children.length

            [first, ..., last] = @children
            @outlineData.First = first.dictionary
            @outlineData.Last = last.dictionary

            for i in [0...@children.length]
                child = @children[i]
                if i > 0
                    child.outlineData.Prev = @children[i-1].dictionary
                if i < @children.length - 1
                    child.outlineData.Next = @children[i+1].dictionary
                child.endOutline()

        @dictionary.end()


module.exports = PDFOutline