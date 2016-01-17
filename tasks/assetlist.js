var fs = require('fs');
var mime = require('mime');
var path = require('path');

module.exports = function (grunt) {
  grunt.registerMultiTask('lyriaAssetList', function () {
    var files = this.files;
    var options = this.options({
      namespace: 'mygame',
      name: 'assetlist',
      ignores: ['scenes', 'i18n', 'prefabs', 'gameobjects', 'prefabs']
    });

    var assetObject = {};
    var assetSize = 0;

    // Iterate over all specified file groups.
    this.files.forEach(function (f) {

      // Concat specified files.
      var src = f.src.filter(function (filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function (filepath) {
        // Read file source.
        var dirname = (filepath.split('/')[1].indexOf('.') > 0) ? 'root' : filepath.split('/')[1];

        if (options.ignores.indexOf(dirname) >= 0) {
          return;
        }

        assetObject[dirname] = assetObject[dirname] || {};

        stat = fs.statSync(filepath);
        assetObject[dirname].files = assetObject[dirname].files || [];
        assetObject[dirname].files.push({
          name: filepath,
          type: mime.lookup(filepath),
          size: stat.size
        });

        if (assetObject[dirname].totalSize) {
          assetObject[dirname].totalSize += stat.size;
        } else {
          assetObject[dirname].totalSize = stat.size;
        }

      });

      var value;
      for (var key in assetObject) {
        value = assetObject[key];

        assetSize += value.totalSize;
      }

      if (assetSize) {
        assetObject.totalSize = assetSize;
      }

      // Write the destination file.
      grunt.file.write(f.dest, 'define("' + options.namespace + '/' + options.name + '",' + JSON.stringify(assetObject) + ');');

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });

  });
};