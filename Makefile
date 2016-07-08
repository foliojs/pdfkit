.PHONY: js

js:
	./node_modules/.bin/coffee -o js -c lib/
	cp -r lib/font/data js/font/data

browser: lib/**/*.coffee
	mkdir -p build/
	./node_modules/.bin/browserify \
		--standalone PDFDocument \
		--debug \
		--transform coffeeify \
		--extension .coffee \
		lib/document.coffee \
		| ./node_modules/.bin/exorcist build/pdfkit.js.map > build/pdfkit.js

browser-demo: js demo/browser.js
	./node_modules/.bin/browserify demo/browser.js > demo/bundle.js

docs: pdf-guide website browser-demo

pdf-guide:
	./node_modules/.bin/coffee docs/generate.coffee

website:
	mkdir -p docs/img
	./node_modules/.bin/coffee docs/generate_website.coffee

clean:
	rm -rf js build demo/bundle.js
