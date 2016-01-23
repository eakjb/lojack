module.exports.runCommand = function (command) {
    var sys = require('sys')
    var exec = require('child_process').exec;
    function puts(error, stdout, stderr) { console.log(stdout) }
    exec(command, puts);
};