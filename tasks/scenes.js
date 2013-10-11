var path = require('path');
var handlebars = require('handlebars');
var sourcemap = require('source-map');
var SourceNode = sourcemap.SourceNode;
var SourceMapGenerator = sourcemap.SourceMapGenerator;
var SourceMapConsumer = sourcemap.SourceMapConsumer;
var beautify = require('js-beautify').js_beautify;

var hbsTemplates = require('../helper/hbstemplates');

module.exports = function(grunt) {

  grunt.registerMultiTask('lyriaScene', 'Concatenates all files into one', function() {
    var options = this.options({
      sourceMap: true,
      name: 'scenelist',
      entryFile: 'scene.js',
      markupFile: 'scene.html',
      localizationFile: 'localization.json',
      partials: 'partials',
      gameObjects: true,
      prefabs: true,
      guiLayer: true,
      beautify: true,
      indentSpaces: 2
    });

    var files = this.files;
    var hasSourceMap = options.sourceMap;

    var handlebarsTemplateOptions = {
      gameObjects: options.gameObjects,
      prefabs: options.prefabs,
      guiLayer: options.guiLayer
    };

    var defaultTemplate = hbsTemplates(handlebarsTemplateOptions);

    for (var i = 0, j = files.length; i < j; i++) {
      (function(file) {
        var destFile = file.dest;

        var scenes = [];

        var sceneLines = 9;

        // source map file of input
        var sourceMaps = [];

        var sourceNode = new SourceNode();

        for (var k = 0, l = file.src.length; k < l; k++) {
          (function(fileSrc) {
            var longFilename = function(shortName) {
              return [fileSrc, shortName].join('/')
            };

            var entryFilename = longFilename(options.entryFile);

            var sceneName = fileSrc.split('/').pop();

            var completeTemplate = (grunt.file.exists(longFilename(options.markupFile)) ? grunt.file.read(longFilename(options.markupFile)) : '') + defaultTemplate;

            var sceneLoc = (grunt.file.exists(longFilename(options.localizationFile))) ? grunt.file.read(longFilename(options.localizationFile)) : 'null';
            var sceneJavaScript = (grunt.file.exists(entryFilename)) ? grunt.file.read(entryFilename) : '';
            var sceneMarkup = handlebars.precompile(completeTemplate);

            if (sceneJavaScript && hasSourceMap) {
              var childNodeChunks = sceneJavaScript.split('\n');
              for (var n = 0, m = childNodeChunks.length - 1; n < m; n++) {
                childNodeChunks[n] += '\n';
              }

              childNodeChunks.map(function(line) {
                if (/\/\/@\s+sourceMappingURL=(.+)/.test(line)) {
                  var sourceMapPath = filename.replace(/[^\/]*$/, RegExp.$1);
                  var sourceMap = grunt.file.readJSON(sourceMapPath);
                  sourceMap.file = entryFilename;
                  var sourceRoot = path.resolve(path.dirname(filename), sourceMap.sourceRoot);
                  sourceMap.sources = sourceMap.sources.map(function(source) {
                    return path.relative(process.cwd(), path.join(sourceRoot, source));
                  });
                  delete sourceMap.sourceRoot;
                  sourceMaps.push(sourceMap);
                  return line.replace(/@\s+sourceMappingURL=[\w\.]+/, '');
                }
                return line;
              }).forEach(function(line, o) {
                //console.log('line ' + (j + 1 + sceneLines) + ': ' + line);
                //sourceNode.add(new SourceNode(j + 2 + sceneLines, 0, scene +
                // '/'
                // + 'scene.js', line));
                sourceNode.add(new SourceNode(o + 1, 0, entryFilename, line));
              });
              sourceNode.setSourceContent(entryFilename, sceneJavaScript);

            }

            scenes.push({
              name: sceneName,
              deps: '{}',
              template: {
                source: sceneMarkup,
                partials: '{}'
              },
              localization: sceneLoc,
              content: sceneJavaScript
            });

          })(file.src[k]);
        }

        var sceneContent = grunt.template.process(grunt.file.read(__dirname + '/../templates/js/scene.js'), {
          data: {
            name: options.name,
            namespace: options.namespace,
            scenes: scenes,
            hasSourceMap: hasSourceMap,
            sourceMapDest: '//@ sourceMappingURL=' + path.basename(destFile) + '.map'
          }
        });

        if (options.beautify) {
          sceneContent = beautify(sceneContent, {
            indent_size: options.indentSpaces
          });
        }

        grunt.file.write(destFile, sceneContent);
        if (hasSourceMap) {
          var codeMap = sourceNode.toStringWithSourceMap({
            file: destFile,
            sourceRoot: '/'
          });

          // Write the source map file.
          var generator = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(codeMap.map.toJSON()));
          sourceMaps.forEach(function(sourceMap) {
            generator.applySourceMap(new SourceMapConsumer(sourceMap));
          });
          var newSourceMap = generator.toJSON();
          newSourceMap.file = path.basename(newSourceMap.file);
         
          grunt.file.write(destFile + '.map', JSON.stringify(newSourceMap, null, (options.beautify) ? '\t' : undefined));
        }

      })(files[i]);
    }
  });
};