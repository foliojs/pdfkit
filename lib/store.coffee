###
PDFObjectStore - stores the object heirarchy for the PDF document
By Devon Govett
###

PDFReference = require './reference'

class PDFObjectStore
    constructor: (@options = {})->

        @objects = {}
        @length = 0
        
        if @options? and @options.hasOutlines
            @root = @ref
                Type: 'Catalog'
                Pages: @ref
                    Type: 'Pages'
                    Count: 0
                    Kids: []
                Outlines: @ref
                    Type: 'Outlines'
                    Count: 0
                PageMode: 'UseOutlines'
        else
            @root = @ref
                Type: 'Catalog'
                Pages: @ref
                    Type: 'Pages'
                    Count: 0
                    Kids: []
        
        @pages = @root.data['Pages']

        @outlines = @root.data['Outlines']        
    
    ref: (data) ->
        @push ++@length, data
        
    push: (id, data) ->
        ref = new PDFReference(id, data)
        @objects[id] = ref
        return ref
            
    addPage: (page) ->
        @pages.data['Kids'].push(page.dictionary)
        @pages.data['Count']++

    addOutline: (outline) ->
        @outlines.data['Count']++

        
module.exports = PDFObjectStore
