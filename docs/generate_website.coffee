jade = require 'jade'
markdown = require('markdown').markdown
fs = require 'fs'
vm = require 'vm'
coffee = require 'coffee-script'
{exec} = require 'child_process'
PDFDocument = require '../'

process.chdir(__dirname)

files = [
  '../README.md'
  'getting_started.coffee.md'
  'vector.coffee.md'
  'text.coffee.md'
  'images.coffee.md'
  'annotations.coffee.md'
]

# shared lorem ipsum text so we don't need to copy it into every example
lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;'

extractHeaders = (tree) ->
  headers = []
  
  for node, index in tree
    if node[0] is 'header' and (headers.length is 0 or node[1].level > 1)
      node[1].level = 2 if node[1].level > 2
      hash = node[2].toLowerCase().replace(/\s+/g, '_')
      node[1].id = hash
      headers.push 
        hash: hash
        title: node[2]
      
  return headers

imageIndex = 0  
generateImages = (tree) ->
  # find code blocks
  codeBlocks = []
  for node in tree
    if node[0] is 'code_block'
      codeBlocks.push node[1]
  
  for node in tree
    if node[0] is 'para' and Array.isArray(node[1]) and node[1][0] is 'img'
      # compile the code
      attrs = node[1][1]
      code = codeBlocks[attrs.alt]
      code = coffee.compile code if code
      delete attrs.height # used for pdf generation
      
      # create a PDF and run the example
      doc = new PDFDocument
      f = "img/#{imageIndex++}"
      file = fs.createWriteStream "#{f}.pdf"
      doc.pipe file
      
      doc.translate doc.x, doc.y
      doc.scale 0.8
      doc.x = doc.y = 0
        
      vm.runInNewContext code,
        doc: doc
        lorem: lorem
      
      delete attrs.title
      delete attrs.alt
      attrs.href = "#{f}.png"
      
      # write the PDF, convert to PNG using the mac `sips`
      # command line tool, and trim with graphicsmagick
      do (f) ->
        file.on 'finish', ->
          exec "sips -s format png #{f}.pdf --out #{f}.png", ->
            fs.unlink "#{f}.pdf"
            exec "gm convert #{f}.png -trim #{f}.png"
            
      doc.end()

pages = []
for file in files
  content = fs.readFileSync file, 'utf8'
  
  # turn github highlighted code blocks into normal markdown code blocks
  content = content.replace /^```coffeescript\n((:?.|\n)*?)\n```/mg, (m, $1) ->
    '    ' + $1.split('\n').join('\n    ')
    
  tree = markdown.parse(content)
  headers = extractHeaders(tree)
  generateImages(tree)
  
  file = file
    .replace(/\.coffee\.md$/, '')
    .replace(/README\.md/, 'index')
    
  pages.push
    file: file
    url: '/docs/' + file + '.html'
    title: headers[0].title
    headers: headers.slice(1)
    content: markdown.toHTML(tree)

for page, index in pages
  page.pages = pages
  page.index = index
  html = jade.renderFile 'template.jade', page
  fs.writeFileSync page.file + '.html', html, 'utf8'
