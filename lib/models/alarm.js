
/**
 * Module dependencies
 */

var pg = require('pg')
  , redis = require('redis')
  , pgUri = ""
  , redisHost = "localhost"
  , redisPort = 6379
  , contract = ""

module.exports = function(options) {
    redisPort = options.redisPort || redisPort;
    redisHost = options.redisHost || redisHost;
    contract = options.contract;
    pgUri = options.pgUri;
    return AlarmsModel;
}

var Alarms = function() {
    this.data = [];
    this.filter = {page: 1, size: 25, locale: 'cs', plc: 1};
    this.total = 0;
};

var AlarmsModel = {}

AlarmsModel.index = function(params, query, fn) { 
    var alarms = new Alarms();

    var client = new pg.Client(pgUri);
    var redisClient = redis.createClient(redisPort, redisHost);

    var plc = query.plc || '1';
    var limit = query.size || 25;
    var offset = limit * (query.page || 1) - limit;
    var lang = query.locale || 'cs';

    alarms.filter = query;

    redisClient.on("error", function (err) {
        console.log("Error " + err);
    });

    client.connect();
    client.on('drain', function() {
	redisClient.quit();
	client.end();
	fn(null, alarms);
    });

    query = client.query("SELECT * FROM alarm_history WHERE plc_id IN (SELECT id FROM plc WHERE id::text ~ '(" + plc + ")') ORDER BY origin_pktime DESC LIMIT $1 OFFSET $2 ", [limit, offset]);
    query.on('row', function(result) { 
	try {
	    alarms.data.push(result);
	    redisClient.lindex("alarm:contract:" + contract + ":plc:" + plc + ":lang:" + lang, result.alarm_id, function(err, text) { 
		result.alarm_text = text;
	    });

	} catch(e) {
	    console.log(e);
	}
    });

    query = client.query("SELECT count(*) FROM alarm_history WHERE plc_id IN (SELECT id FROM plc WHERE id::text ~ '("+plc+")')", []);
    query.on('row', function(result) { 
	try {
	    alarms.total = result.count;
	} catch(e) {
	    console.log(e);
	}
    });
};
