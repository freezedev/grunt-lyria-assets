module.exports = (grunt) ->
  {SourceNode, SourceMapGenerator, SourceMapConsumer} = require 'source-map'
  
  defaultSceneTemplate = 
  """
  {{#if gameobject}}
    {{#each gameobject}}
      <div id="{{name}}">{{{content}}}</div>
    {{/each}}
  {{/if}}
  
  {{#if prefab}}
    {{#each prefab}}
      <div id="{{name}}">{{{content}}}</div>
    {{/each}}
  {{/if}}
  
  {{#if guilayer}}
    {{{guilayer.content}}}
  {{/if}}
  """
  
  sceneSource =
  """
  define('%= namespace %>/scenelist', ['lyria/scene', 'lyria/template/engine'], function(Scene, TemplateEngine) {
    var sceneList = {};
    <%= scenes  %>
    return sceneList;
  });
  """
  
  sceneContent =
  """
  sceneList['<%= name %>'] = new Scene('<%= name %>', <%= deps %>, function() {
    this.localization = <%= localization %>;
    this.template = this.template || {};
    this.template.source = <%= templateSource %>;
    this.template.partials = <%= templatePartials %>;
    
    var sceneFunc = <%= sceneContent %>;
    if (typeof sceneFunc === 'function') {
      sceneFunc = sceneFunc.apply(this, arguments);
    }
    
    return sceneFunc;
  });
  """
  
  grunt.registerMultiTask 'lyriaScene', 'Concatenates all files into one', ->
    done = @async()
    
    
