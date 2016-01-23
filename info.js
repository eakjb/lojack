var os = require('os');

var request = require('request');

var config = require('./config.local.js');
var getIP = require('external-ip')();

var util = require('./util.js');

var APIs = [{
    property: 'location',
    url:'http://ipinfo.io'
}];

module.exports = function (callback) {
    var info = {
        _id: config._id,
        public_ip: 'unknown',
        local_interfaces: 'unknown',
        timestamp: Date.now(),
        date: new Date()
    };

    var series = [
        function (next) {
            getIP(function (err, ip) {
                if (err) {
                    console.log(err);
                }

                info.public_ip = ip;

                next();
            });
        }, function (next) {
            info.local_interfaces = os.networkInterfaces();
            next();
        }, function (next) {
            next();
        }
    ];

    APIs.forEach(function (api) {
        series.push(function (next) {

            request(api.url, {
                json:true
            }, function (err, result) {
                if (err) {
                    console.log(err);
                }

                info[api.property] = result.body;
                next();
            });
        });
    });

    util.series(series, function () {
        callback(info);
    });
};