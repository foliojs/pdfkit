(function() {
  var PDFImage;
  var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; };

  PDFImage = require('../image');

  module.exports = {
    initImages: function() {
      this._imageRegistry = {};
      return this._imageCount = 0;
    },
    image: function(src, x, y, options) {
      var bh, bp, bw, h, hp, image, ip, label, pages, w, wp, _ref, _ref2, _ref3, _ref4, _ref5;
      if (options == null) options = {};
      if (typeof x === 'object') {
        options = x;
        x = null;
      }
      x = (_ref = x != null ? x : options.x) != null ? _ref : this.x;
      y = (_ref2 = y != null ? y : options.y) != null ? _ref2 : this.y;
      if (this._imageRegistry[src]) {
        _ref3 = this._imageRegistry[src], image = _ref3[0], label = _ref3[1], pages = _ref3[2];
        if (_ref4 = this.page, __indexOf.call(pages, _ref4) < 0) {
          pages.push(this.page);
        }
      } else {
        image = PDFImage.open(src);
        label = "I" + (++this._imageCount);
        this._imageRegistry[src] = [image, label, [this.page]];
      }
      w = options.width || image.width;
      h = options.height || image.height;
      if (options.width && !options.height) {
        wp = w / image.width;
        w = image.width * wp;
        h = image.height * wp;
      } else if (options.height && !options.width) {
        hp = h / image.height;
        w = image.width * hp;
        h = image.height * hp;
      } else if (options.scale) {
        w = image.width * options.scale;
        h = image.height * options.scale;
      } else if (options.fit) {
        _ref5 = options.fit, bw = _ref5[0], bh = _ref5[1];
        bp = bw / bh;
        ip = image.width / image.height;
        if (ip > bp) {
          w = bw;
          h = bw / ip;
        } else {
          h = bh;
          w = bh * ip;
        }
      }
      if (this.y === y) this.y += h;
      y = this.page.height - y - h;
      this.save();
      this.addContent("" + w + " 0 0 " + h + " " + x + " " + y + " cm");
      this.addContent("/" + label + " Do");
      this.restore();
      return this;
    },
    embedImages: function(fn) {
      var images, item, proceed, src;
      var _this = this;
      images = (function() {
        var _ref, _results;
        _ref = this._imageRegistry;
        _results = [];
        for (src in _ref) {
          item = _ref[src];
          _results.push(item);
        }
        return _results;
      }).call(this);
    var events = require("events");

    var eventEmitter = new events.EventEmitter();

    var proceed = function () {
        (function (nrOfImages) {
            var imagesRetrieved = 0;
            //console.log("Images to retrieve", nrOfImages);
            eventEmitter.on('imageProcessed', function (info) {
                imagesRetrieved += 1;
                //console.log("Image Retrieved", imagesRetrieved);
                if (imagesRetrieved === nrOfImages) {
                    eventEmitter.removeAllListeners('imageProcessed');
                    return fn();
                }
            });
        }(images.length));

        var processImage = function (registryIndex, pageIndex, obj) {
            //console.log("processImage", registryIndex, pageIndex);
            if (images[registryIndex][2][pageIndex].xobjects[images[registryIndex][1]] === null ||
                images[registryIndex][2][pageIndex].xobjects[images[registryIndex][1]] === undefined) {
                //console.log("images[registryIndex][2][pageIndex].xobjects[images[registryIndex][1]]");
                images[registryIndex][2][pageIndex].xobjects[images[registryIndex][1]] = obj;
            } else {
                console.log("not null", images[registryIndex][2][pageIndex].xobjects[images[registryIndex][1]]);
            }
            eventEmitter.emit('imageProcessed');
        };

        var processImageObject = function (image, pages, registryIndex) {
            image.object(_this, function (obj) {
                var j,
                    len;
                for (j = 0, len = pages.length; j < len; j += 1) {
                    processImage(registryIndex, j, obj);
                }
            });
        };

        var i;
        for (i = images.length - 1; i >= 0; i -= 1) {
            //console.log("Pages", images[i][2].length, "i", i);
            processImageObject(images[i][0], images[i][2], i);
        }
    };
    return proceed();
    }
  };

}).call(this);
