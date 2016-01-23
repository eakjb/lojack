module.exports.delay = function (length, and) {
    return function (env) {
        var andRes = true;
        if (and) andRes = and(env);
        if (env.lastRun === 'NEVER') return andRes;
        return andRes && (env.now.getTime() > env.lastRun.getTime() + length);
    }
};

module.exports.WEEK_DAYS = [1,2,3,4,5];
module.exports.WEEKENDS = [0,6];
module.exports.FULL_WEEK = [0,1,2,3,4,5,6];
module.exports.SCHOOL_DAYS = [0,1,2,3,4];

module.exports.time = function (time, and) {
    if (time === 'TEST') {
        var now = new Date();
        time = {};
        time.hour = now.getHours();
        time.minute = now.getMinutes();
        time.second = now.getSeconds() + 1;
        time.daysOfWeek = module.exports.FULL_WEEK;
    }
    //console.log('Running task at ' + hour + ':' + minute + ':' + second);
    return function (env) {
        if ((and && and(env)) || !and) {
            return (env.lastRun === 'NEVER' ||
                (env.now.getTime() > env.lastRun.getTime() + 1000)) &&
                env.now.getHours() === time.hour &&
                env.now.getMinutes() === time.minute &&
                env.now.getSeconds() === time.second &&
                (time.daysOfWeek.indexOf(env.now.getDay()) >= 0);
        }
        return false;
    };
};

module.exports.series = function (callbacks, last) {
    var results = [];
    function next() {
        var callback = callbacks.shift();
        if(callback) {
            callback(function() {
                results.push(Array.prototype.slice.call(arguments));
                next();
            });
        } else {
            last(results);
        }
    }
    next();
};