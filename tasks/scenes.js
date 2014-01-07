var fs = require('fs');
var path = require('path');

var handlebars = require('handlebars');
var sourcemap = require('source-map');
var esprima = require('esprima');
var beautify = require('js-beautify').js_beautify;

var hbsTemplates = require('../helper/hbstemplates');

var SourceNode = sourcemap.SourceNode;
var SourceMapGenerator = sourcemap.SourceMapGenerator;
var SourceMapConsumer = sourcemap.SourceMapConsumer;

module.exports = function(grunt) {

  grunt.registerMultiTask('lyriaScene', 'Concatenates all files into one', function() {
    var options = this.options({
      sourceMap: true,
      base: null,
      shortNames: false,
      processName: function(name) {
        return name;
      },
      name: 'scenelist',
      entryFile: 'scene.js',
      markupFile: 'scene.html',
      sourceRoot: '',
      localizationFile: 'localization.json',
      partials: 'partials',
      partialMatch: '*.html',
      gameObjects: true,
      prefabs: true,
      guiLayer: true,
      beautify: true,
      indentSpaces: 2
    });

    var files = this.files;
    var hasSourceMap = options.sourceMap;
    var base = options.base;

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
              return [fileSrc, shortName].join('/');
            };

            var entryFilename = longFilename(options.entryFile);
            var partialsDir = longFilename(options.partials);

            var preprocessSceneName = (base) ? fileSrc.split(base)[1] : fileSrc;
            var sceneName = options.processName((options.shortNames) ? preprocessSceneName.split('/').pop() : preprocessSceneName);

            var completeTemplate = (grunt.file.exists(longFilename(options.markupFile)) ? grunt.file.read(longFilename(options.markupFile)) : '') + defaultTemplate;

            var sceneLoc = null;
            var sceneLocContent = '';
            
            if (grunt.file.exists(longFilename(options.localizationFile))) {
              sceneLoc = grunt.file.read(longFilename(options.localizationFile));
              sceneLocContent = ((options.beautify) ? beautify(sceneLoc) : sceneLoc);
            }
            
            var sceneJavaScript = (grunt.file.exists(entryFilename)) ? grunt.file.read(entryFilename) : '';
            var sceneMarkup = handlebars.precompile(completeTemplate);
            
            var sceneTpl = ((options.beautify) ? beautify(sceneMarkup) : sceneMarkup);

            var scenePartialDir = (grunt.file.exists(partialsDir)) ? grunt.file.match(options.partialMatch, fs.readdirSync(partialsDir)) : [];

            var scenePartials = {};

            for (var p = 0, q = scenePartialDir.length; p < q; p++) {
              (function(partial) {
                var shortName = partial.split(path.extname(partial))[0];

                if (grunt.file.exists(partialsDir, partial)) {
                  scenePartials[shortName] = handlebars.precompile(grunt.file.read([partialsDir, partial].join('/')));
                }
              })(scenePartialDir[p]);
            }
            
            var metadata = {};

            if (sceneJavaScript) {
              var parsedSceneFunc = esprima.parse(sceneJavaScript, {
                comment: true
              });

              var commentArray = parsedSceneFunc.comments;

              if (commentArray != null && Array.isArray(commentArray) && commentArray.length > 0) {

                for (var i = 0, j = commentArray.length; i < j; i++) {

                  (function(comment) {
                    if ((comment.type == null && comment.value == null) || comment.type !== 'Block') {
                      return;
                    }

                    var value = comment.value;
                    
                    if (value.indexOf('metadata') > 0) {
                      try {
                        metadata = JSON.parse(value);
                        metadata = metadata.metadata;
                      } catch(e) {
                        grunt.log.error('Error reading metadata: Not valid JSON');
                        return;
                      }
                    }

                  })(commentArray[i]);
                }
              }
            }

            if (sceneJavaScript && hasSourceMap) {
              var childNodeChunks = sceneJavaScript.split('\n');
              for (var n = 0, m = childNodeChunks.length - 1; n < m; n++) {
                childNodeChunks[n] += '\n';
              }

              childNodeChunks.map(function(line) {
                if (/\/\/@\s+sourceMappingURL=(.+)/.test(line) || /\/\/#\s+sourceMappingURL=(.+)/.test(line)) {
                  var sceneSourceRoot = [options.sourceRoot, sceneName].join('/');
                  
                  var sourceMapPath = entryFilename.replace(/[^\/]*$/, RegExp.$1);
                  var sourceMap = grunt.file.readJSON(sourceMapPath);
                  sourceMap.file = entryFilename;
                  var sourceRoot = path.resolve(path.dirname(entryFilename), sceneSourceRoot, sourceMap.sourceRoot);
                  sourceMap.sources = sourceMap.sources.map(function(source) {
                    return path.relative(process.cwd(), path.join(sourceRoot, source));
                  });
                  delete sourceMap.sourceRoot;
                  sourceMaps.push(sourceMap);
                  return line.replace(/@\s+sourceMappingURL=[\w\.]+/, '').replace(/#\s+sourceMappingURL=[\w\.]+/, '');
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
            
            var defaultData = {};
            
            
            var data = grunt.util._.merge(defaultData, metadata.data);
            
            var templateData = {};
            
            if (scenePartials && scenePartials['guilayer']) {
              templateData.guilayer = true;
            }

            scenes.push({
              name: metadata.name || sceneName,
              deps: JSON.stringify(metadata.deps) || '{}',
              template: {
                source: sceneMarkup,
                partials: (function(obj) {
                  var content = '{';

                  grunt.util._.each(obj, function(value, key) {
                    content += '"' + key + '": TemplateEngine.compile(' + value.toString() + ')';

                    if (Object.keys(obj)[key] !== Object.keys(obj).length - 1) {
                      content += ',';
                    }
                  });

                  content += '}';

                  return content;
                })(scenePartials)
              },
              data: JSON.stringify(data),
              templateData: JSON.stringify(templateData),
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
            sourceMapDest: '//# sourceMappingURL=' + path.basename(destFile) + '.map'
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