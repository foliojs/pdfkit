###
PDFObjectStore - stores the object heirarchy for the PDF document
By Devon Govett
###
 
PDFReference = require './reference'

class PDFObjectStore
    constructor: (@options = {})->

        @objects = {}
        @length = 0

        @root = @ref
            Type: 'Catalog'
            Pages: @ref
                Type: 'Pages'
                Count: 0
                Kids: []

        if @options.hasOutlines
            @root.data['PageMode'] = 'UseOutlines'
            @root.data['Outlines'] = @ref
                    Type: 'Outlines'
                    Count: 0

        @pages    = @root.data['Pages']
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
        
module.exports = PDFObjectStore
