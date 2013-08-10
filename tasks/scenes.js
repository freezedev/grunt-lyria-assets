(function() {
  module.exports = function(grunt) {
    var SourceMapConsumer, SourceMapGenerator, SourceNode, defaultSceneTemplate, sceneContent, sceneSource, _ref;
    _ref = require('source-map'), SourceNode = _ref.SourceNode, SourceMapGenerator = _ref.SourceMapGenerator, SourceMapConsumer = _ref.SourceMapConsumer;
    defaultSceneTemplate = "{{#if gameobject}}\n  {{#each gameobject}}\n    <div id=\"{{name}}\">{{{content}}}</div>\n  {{/each}}\n{{/if}}\n\n{{#if prefab}}\n  {{#each prefab}}\n    <div id=\"{{name}}\">{{{content}}}</div>\n  {{/each}}\n{{/if}}\n\n{{#if guilayer}}\n  {{{guilayer.content}}}\n{{/if}}";
    sceneSource = "define('%= namespace %>/scenelist', ['lyria/scene', 'lyria/template/engine'], function(Scene, TemplateEngine) {\n  var sceneList = {};\n  <%= scenes  %>\n  return sceneList;\n});";
    sceneContent = "sceneList['<%= name %>'] = new Scene('<%= name %>', <%= deps %>, function() {\n  this.localization = <%= localization %>;\n  this.template = this.template || {};\n  this.template.source = <%= templateSource %>;\n  this.template.partials = <%= templatePartials %>;\n  \n  var sceneFunc = <%= sceneContent %>;\n  if (typeof sceneFunc === 'function') {\n    sceneFunc = sceneFunc.apply(this, arguments);\n  }\n  \n  return sceneFunc;\n});";
    return grunt.registerMultiTask('lyriaScene', 'Concatenates all files into one', function() {
      var done;
      return done = this.async();
    });
  };

}).call(this);
