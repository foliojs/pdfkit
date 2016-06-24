.PHONY: js

js:
	`npm bin`/coffee -o js -c lib/
	cp -r lib/font/data js/font/data

browser: lib/**/*.coffee
	mkdir -p build/
	`npm bin`/browserify \
		--standalone PDFDocument \
		--debug \
		--transform coffeeify \
		--extension .coffee \
		lib/document.coffee \
		| `npm bin`/exorcist build/pdfkit.js.map > build/pdfkit.js

browser-demo: js demo/browser.js
	`npm bin`/browserify demo/browser.js > demo/bundle.js

docs: pdf-guide website browser-demo

pdf-guide:
	`npm bin`/coffee docs/generate.coffee

website:
	mkdir -p docs/img
	`npm bin`/coffee docs/generate_website.coffee

clean:
	rm -rf js build demo/bundle.js
