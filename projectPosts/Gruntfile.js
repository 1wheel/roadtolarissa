module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      files: ['**/*.js', '**/*.html'],
      options: {
        nospawn: true,
        livereload: true,
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
};
