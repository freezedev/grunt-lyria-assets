define('%= namespace %>/scenelist', ['lyria/scene', 'lyria/template/engine'], function(Scene, TemplateEngine) {
  var sceneList = {};
  <% _.each(scenes, function(scene) { %>
    sceneList['<%= scene.name %>'] = new Scene('<%= scene.name %>', <%= scene.deps %>, function() {
      this.localization = <%= scene.localization %>;
      this.template = this.template || {};
      this.template.source = <%= scene.templateSource %>;
      this.template.partials = <%= scene.templatePartials %>;
      
      var sceneFunc = <%= scene.sceneContent %>;
      if (typeof sceneFunc === 'function') {
        sceneFunc = sceneFunc.apply(this, arguments);
      }
      
      return sceneFunc;
    });
  <% }); %>
  return sceneList;
});