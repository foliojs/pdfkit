###
PDFObject - converts JavaScript types into their corrisponding PDF types.
By Devon Govett
###

class PDFObject
    pad = (str, length) ->
        (Array(length + 1).join('0') + str).slice(-length)
    
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
            
    # Convert Big-endian UCS-2 to Little-endian to support most PDFRreaders
    swapBytes = (buff) ->
        l = buff.length
        if l & 0x01
            throw new Error("Buffer length must be even")
        else
            for i in [0...l - 1] by 2
                a = buff[i]
                buff[i] = buff[i+1]
                buff[i+1] = a 
        return buff
            
    @s: (string, swap = false) ->
        string = string.replace(/\\/g, '\\\\\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            
        if swap
            string = swapBytes(new Buffer('\ufeff' + string, 'ucs-2')).toString('binary')
        
        return {
            isString: yes
            toString: -> string
        }
        
module.exports = PDFObject
PDFReference = require './reference'