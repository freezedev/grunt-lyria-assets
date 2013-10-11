var path = require('path');
var mime = require('mime');

module.exports = function(grunt) {
  grunt.registerMultiTask('lyriaData', function() {
    var files = this.files;
    var options = this.options({
      namespace: 'mygame',
      name: 'data'
    });
    
    var content = {};
    
    for (var i = 0, j = files.length; i < j; i++) {
      (function(file) {
        var dest = file.dest;
        
        for (var k = 0, l = file.src.length; k < l; k++) {
          (function(fileSrc) {
            var shortName = path.basename(fileSrc).split(path.extname(fileSrc))[0];
        
            content[shortName] = content[shortName] || {};
            
            if (grunt.file.exists(fileSrc)) {
              if (mime.lookup(fileSrc) === 'application/json') {
                content[shortName] = grunt.file.readJSON(fileSrc);              
              } else {
                content[shortName] = grunt.file.read(fileSrc);
              }              
            }
          })(file.src[k]);
        }
        
        
      var fileContent = 'define("' + options.namespace + '/' + options.name + '", ' + JSON.stringify(content) + ');';
      
      grunt.file.write(dest, fileContent);
        
      })(files[i]);
    }
    
  });
};
