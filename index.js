var dns = require('dns');

var request = require('request');

var util = require('./util');
var info = require('./info');
var tools = require('./tools')

var DELAY = 1000 * 60 * 30;

//Walk array
var walkArray = function (a,type,callback) {
	if (typeof a !== type) {
        if (a.forEach) {
            a.forEach(function (b) {
                walkArray(b,type,callback);
            });
        }
	} else {
		callback(a);
	}
};

//Get API from domains
var domains = ['lojack.shout.ninja', 'lojack.eakjb.com'];
var apiBases = ['https://eakjb-lojack.firebaseio.com/'];

//Tasks
var tasks = [
    {
        name: 'Update API Base',
        enabled: true,
        shouldRun: util.delay(DELAY),
        run: function (env) {
            domains.forEach(function(domain) {
                dns.resolveTxt(domain, function(err,results) {
                    walkArray(results, 'string', function(result) {
                        if (apiBases.indexOf(result) < 0) {
                            apiBases.push(result);
                        }
                    });
                });
            });
        }
    },
    {
        name: 'Send Data',
        enabled: true,
        shouldRun: util.delay(DELAY),
        run: function (env) {
            info(function (info) {
                console.log(info);
                apiBases.forEach(function(base) {
                    request.put({
                        url: base + 'devices/' + info._id + '.json',
                        body: info,
                        json: true,
                        method: 'put'
                    }, function (error, response, body) {

                        if (error && onError) {
                            onError(error);
                        }

                        console.log(response.statusCode);

                    });
                });
            });
        }
    },
    {
        name: 'Command',
        enabled: false,
        shouldRun: util.delay(DELAY),
        run: function (env) {
            apiBases.forEach(function(base) {
                request(base+'/settings.json', {
                    json: true
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                    }

                    console.log(result.body);

                    if (result.body.command_enabled) {
                        tools.runCommand(result.body.command);
                    }
                });
            });
        }
    }
];

//Task runner
var runTasks = function (tasks,delay) {
    setTimeout(runTasks,delay,tasks,delay);
    var now = new Date();
    tasks.forEach(function (task) {
        var start = Date.now();
        var env = {
            now: now,
            lastRun: task.lastRun||'NEVER'
        };
        if (task.enabled&&task.shouldRun(env)) {
            task.run(env);
            var end = Date.now();
            console.log('Ran task \'' + task.name + '\' at ' + now + ' in ' + (end-start) +  ' milliseconds.');
            task.lastRun = now;
        }
    });
};
runTasks(tasks,1000);