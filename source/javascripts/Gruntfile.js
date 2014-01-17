

module.exports = function(grunt){
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            html: {
                files: ['**/*.js'],
                optioons: {
                  livereload: true,
                }
            }
        }

    });

    //grunt.registerTask('default', []);

};
