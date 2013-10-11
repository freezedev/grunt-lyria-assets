define('<%= namespace %>/<%= name %>', ['lyria/scene', 'lyria/template/engine', 'lyria/localization'], function(Scene, TemplateEngine, Localization) {
  
  return function(param) {
    for (sceneKey in param) {
      var sceneValue = param[sceneKey];
      Scene.requireAlways[sceneKey] = sceneValue;
    }
    
    var sceneList = {};
    <% _.each(scenes, function(scene) { %>
      sceneList['<%= scene.name %>'] = new Scene('<%= scene.name %>', <%= scene.deps %>, function() {
        var self = this;
        
        this.localization = new Localization(<%= scene.localization %>);
        this.template = this.template || {};
        this.template.partials = <%= scene.template.partials %>;
        this.template.source = TemplateEngine.compile(<%= scene.template.source %>, {
          helpers: self.template.helpers,
          partials: self.template.partials
        });
        
        (function() {
          <%= scene.content %>
        }).call(this);
        
      });
    <% }); %>
    return sceneList;
  };
  
});
<% if (hasSourceMap) {%>
<%= sourceMapDest %>
<% } %>
