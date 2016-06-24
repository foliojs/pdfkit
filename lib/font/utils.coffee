
# Swaps the properties and values of an object and returns the result
exports.invert = (object) ->
  ret = {}
  for key, val of object
    ret[val] = key
    
  return ret