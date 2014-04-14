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
		
browser-demo: demo/browser.js
	./node_modules/.bin/browserify --extension .coffee demo/browser.js > demo/bundle.js
		
clean:
	rm -rf js build demo/bundle.js
