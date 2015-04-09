var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');

var TinyStore = function(path){
  this.path = path;
};

util.inherits(TinyStore, EventEmitter);

TinyStore.prototype.set = function(key, value, callback){
  var json;
  try {
    var content = fs.readFileSync(this.path, { encoding: 'utf-8' });
    json = JSON.parse(content);
  } catch (e){
    json = {};
  }
  if (value !== json[key]){
    json[key] = value;
    this.emit('change', key, value);
  }
  fs.writeFile(this.path, JSON.stringify(json), callback);
};

TinyStore.prototype.get = function(key, callback){
  var content;
  try {
    content = fs.readFileSync(this.path, { encoding: 'utf-8' });
  } catch (e){
    return null;
  }
  var json = JSON.parse(content);
  return json[key];
};

module.exports = TinyStore;
