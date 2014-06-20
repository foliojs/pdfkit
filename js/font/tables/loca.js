// Generated by CoffeeScript 1.7.1
(function() {
  var Data, LocaTable, Table,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Table = require('../table');

  Data = require('../../data');

  LocaTable = (function(_super) {
    __extends(LocaTable, _super);

    function LocaTable() {
      return LocaTable.__super__.constructor.apply(this, arguments);
    }

    LocaTable.prototype.parse = function(data) {
      var format, i;
      data.pos = this.offset;
      format = this.file.head.indexToLocFormat;
      if (format === 0) {
        return this.offsets = (function() {
          var _i, _ref, _results;
          _results = [];
          for (i = _i = 0, _ref = this.length; _i < _ref; i = _i += 2) {
            _results.push(data.readUInt16() * 2);
          }
          return _results;
        }).call(this);
      } else {
        return this.offsets = (function() {
          var _i, _ref, _results;
          _results = [];
          for (i = _i = 0, _ref = this.length; _i < _ref; i = _i += 4) {
            _results.push(data.readUInt32());
          }
          return _results;
        }).call(this);
      }
    };

    LocaTable.prototype.indexOf = function(id) {
      return this.offsets[id];
    };

    LocaTable.prototype.lengthOf = function(id) {
      return this.offsets[id + 1] - this.offsets[id];
    };

    LocaTable.prototype.encode = function(offsets) {
      var o, offset, ret, table, _i, _j, _k, _len, _len1, _len2, _ref;
      table = new Data;
      for (_i = 0, _len = offsets.length; _i < _len; _i++) {
        offset = offsets[_i];
        if (!(offset > 0xFFFF)) {
          continue;
        }
        _ref = this.offsets;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          o = _ref[_j];
          table.writeUInt32(o);
        }
        return ret = {
          format: 1,
          table: table.data
        };
      }
      for (_k = 0, _len2 = offsets.length; _k < _len2; _k++) {
        o = offsets[_k];
        table.writeUInt16(o / 2);
      }
      return ret = {
        format: 0,
        table: table.data
      };
    };

    return LocaTable;

  })(Table);

  module.exports = LocaTable;

}).call(this);
