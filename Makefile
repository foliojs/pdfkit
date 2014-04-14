js: lib/**/*.coffee
	coffee -o js -c lib/
	cp -r lib/font/data js/font/data
	
browser: lib/**/*.coffee
	mkdir -p build/
	./node_modules/.bin/browserify \
		--standalone PDFDocument \
		--debug \
		--extension=.coffee \
		. | ./node_modules/.bin/exorcist build/pdfkit.js.map > build/pdfkit.js
		
clean:
	rm -rf js build
