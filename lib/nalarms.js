
/**
 * Module dependencies
 */

// ---- ---- ----


var AlarmController = {}
  , Alarm = null

module.exports = function(options) {
    Alarm = require('./models/alarm')(options);
    return AlarmController;
}

AlarmController.index = function(req, res, next) {
    try {
	var params = req.params;
	var query = req.query;
	Alarm.index(params, query, function(err, alarms) {
	    if(err) return next(err);
	    res.send(alarms);
	});
    } catch(err) {
	console.log(err);
	res.send('404');
    }
}
