###
PDFObjectStore - stores the object heirarchy for the PDF document
By Devon Govett
###

PDFReference = require './reference'

class PDFObjectStore
    constructor: ->
        @objects = {}
        @length = 0
        
        @root = @ref
            Type: 'Catalog'
            
        @root.data['Pages'] = @ref
            Type: 'Pages'
            Count: 0
            Kids: []
            
        @pages = @root.data['Pages']
            
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