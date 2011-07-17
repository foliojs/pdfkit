###
# An implementation of Ruby's string.succ method.
# By Devon Govett
#
# Returns the successor to str. The successor is calculated by incrementing characters starting 
# from the rightmost alphanumeric (or the rightmost character if there are no alphanumerics) in the
# string. Incrementing a digit always results in another digit, and incrementing a letter results in
# another letter of the same case.
#
# If the increment generates a carry, the character to the left of it is incremented. This 
# process repeats until there is no carry, adding an additional character if necessary.
#
# succ("abcd")      == "abce"
# succ("THX1138")   == "THX1139"
# succ("<<koala>>") == "<<koalb>>"
# succ("1999zzz")   == "2000aaa"
# succ("ZZZ9999")   == "AAAA0000"
###

exports.successorOf = (input) ->
    alphabet = 'abcdefghijklmnopqrstuvwxyz'
    length = alphabet.length
    result = input
    
    i = input.length
    while i >= 0
        last = input.charAt(--i)
        
        if isNaN(last)
            index = alphabet.indexOf(last.toLowerCase())
            
            if index is -1
                next = last
                carry = true
            else
                next = alphabet.charAt((index + 1) % length)
                isUpperCase = last is last.toUpperCase()
                if isUpperCase
                    next = next.toUpperCase()
                
                carry = index + 1 >= length
                
                if carry and i is 0
                    added = if isUpperCase then 'A' else 'a'
                    result = added + next + result.slice(1)
                    break
        else
            next = +last + 1
            carry = next > 9
            next = 0 if carry
            
            if carry and i is 0
                result = '1' + next + result.slice(1)
                break
            
        result = result.slice(0, i) + next + result.slice(i + 1)
        break unless carry
    
    return result

# Swaps the properties and values of an object and returns the result
exports.invert = (object) ->
    ret = {}
    for key, val of object
        ret[val] = key
        
    return ret