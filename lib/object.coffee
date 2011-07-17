###
PDFObject - converts JavaScript types into their corrisponding PDF types.
By Devon Govett
###

pad = (str, length) ->
    (Array(length + 1).join('0') + str).slice(-length)

class PDFObject
    @convert: (object) ->
        if Array.isArray object
            items = (PDFObject.convert e for e in object).join(' ')
            '[' + items + ']'
            
        else if typeof object is 'string'
            '/' + object

        else if object?.isString
            '(' + object + ')'
            
        else if object instanceof PDFReference
            object.toString()
            
        else if object instanceof Date
            '(D:' + pad(object.getUTCFullYear(), 4) + 
                    pad(object.getUTCMonth(), 2) + 
                    pad(object.getUTCDate(), 2) + 
                    pad(object.getUTCHours(), 2) + 
                    pad(object.getUTCMinutes(), 2) + 
                    pad(object.getUTCSeconds(), 2) + 
            'Z)'
            
        else if {}.toString.call(object) is '[object Object]'
            out = ['<<']
            for key, val of object
                out.push '/' + key + ' ' + PDFObject.convert(val)
                
            out.push '>>'
            out.join '\n'
            
        else 
            '' + object
            
    @s: (string) ->
        string = string.replace(/\\/g, '\\\\\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
        
        isString: yes
        toString: -> string
        
module.exports = PDFObject
PDFReference = require './reference'