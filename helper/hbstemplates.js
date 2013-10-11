var fs = require('fs');

var gameObjectTemplate = fs.readFileSync('./templates/markup/gameobject.html', 'utf8');

var prefabTemplate = fs.readFileSync('./templates/markup/prefab.html', 'utf8');

var guiLayerTemplate = fs.readFileSync('./templates/markup/guilayer.html', 'utf8');

module.exports = function(options) {
  var gameObjects, guiLayer, prefabs, result;
  prefabs = options.prefabs, gameObjects = options.gameObjects, guiLayer = options.guiLayer;
  result = '';
  if (options.gameObjects) {
    result += gameObjectTemplate;
  }
  if (options.prefabs) {
    result += prefabTemplate;
  }
  if (options.guiLayer) {
    result += guiLayerTemplate;
  }
  return result;
}; 