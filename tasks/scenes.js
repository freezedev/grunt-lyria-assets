var handlebars = require('handlebars');

module.exports = function(grunt) {

  grunt.registerMultiTask('lyriaScene', 'Concatenates all files into one', function() {
    var options = this.options({
      name: 'scenelist',
      entryFile: 'scene.js',
      markupFile: 'scene.html',
      localizationFile: 'localization.json',
      partials: 'partials'
    });

    var files = this.files;

    for (var i = 0, j = files.length; i < j; i++) {
      (function(file) {
        var destFile = file.dest;

        var scenes = [];

        for (var k = 0, l = file.src.length; k < l; k++) {
          (function(fileSrc) {
            var sceneName = fileSrc.split('/').pop();

            var sceneLoc = JSON.stringify(grunt.file.readJSON([fileSrc, options.localizationFile].join('/')));
            var sceneJavaScript = grunt.file.read([fileSrc, options.entryFile].join('/'));
            var sceneMarkup = handlebars.precompile(grunt.file.read([fileSrc, options.markupFile].join('/')));

            scenes.push({
              name: sceneName,
              deps: '[]',
              template: {
                source: sceneMarkup,
                partials: '{}'
              },
              localization: sceneLoc,
              content: sceneJavaScript
            });
          })(file.src[k]);
        }

        var sceneContent = grunt.template.process(grunt.file.read('./templates/js/scene.js'), {
          data: {
            name: options.name,
            namespace: options.namespace,
            scenes: scenes
          }
        });
        
        
        grunt.file.write(destFile, sceneContent);

      })(files[i]);
    }
  });
};

