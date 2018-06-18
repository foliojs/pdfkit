PDFOutline = require '../outline'

module.exports =
    initOutline: ->
    
        @_root.data['Outlines'] = @ref
            Count: 0

        @root_outlines = @_root.data['Outlines']

        @outlines = []
        @currentOutline = @outlines
        @levelHead = @root_outlines
        @levs = []
        @prevs = []

    isOutlineRoot: () ->
        return @prevs.length == 0

    addOutline: (title) ->
        prevNode = null

        if @isOutlineRoot()
            parent = @root_outlines
        else
            parent = @levelHead.dictionary

        if @currentOutline.length > 0
            prevNode = @currentOutline[@currentOutline.length - 1]
            if prevNode instanceof Array
                prevNode = @currentOutline[@currentOutline.length-2]

        outline = new PDFOutline(this, parent, title, @page)

        if @outlines.length == 0
            @root_outlines.data['First'] = outline.dictionary

        parent.data['Last'] = outline.dictionary
        parent.data['Count']++

        if prevNode != null
            outline.dictionary.data['Prev'] = prevNode.dictionary
            prevNode.dictionary.data['Next'] = outline.dictionary

        @currentOutline.push outline

        return this

    addSublevelOutline: (title) ->

        if @currentOutline.length == 0 or (@currentOutline[@currentOutline.length-1] instanceof Array)
            throw new Error '
                Cannot start sublevel with empty current level:
                add current level outline first.'

        @levs.push @levelHead
        @levelHead = @currentOutline[@currentOutline.length-1]
        @prevs.push @currentOutline
        @currentOutline.push []
        @currentOutline = @currentOutline[@currentOutline.length-1]

        outline = new PDFOutline(this, @levelHead.dictionary, title, @page)
        @currentOutline.push outline
        @levelHead.dictionary.data['First'] = outline.dictionary
        @levelHead.dictionary.data['Last'] = outline.dictionary
        @levelHead.dictionary.data['Count'] = 1

        return this

    endOutlineSublevel: () ->

        if @isOutlineRoot()
            throw new Error 'cannot end root outlines level'

        @currentOutline = @prevs.pop()
        count = @levelHead.dictionary.data['Count']
        @levelHead = @levs.pop()

        if @isOutlineRoot()
            @levelHead.data['Count'] += count
        else
            @levelHead.dictionary.data['Count'] += count

        return this

    endOutlines: (outlines) ->
        for outline in outlines
            if outline instanceof Array
                @endOutlines(outline)
            else
                outline.dictionary.end()

    endOutline: () ->
        delete @_root.data['Outlines'].data.Count
        @_root.data['Outlines'].end()
        @endOutlines(@outlines)
