
/**
 * Test script
 */

var AlarmsController = require(process.cwd() + "/lib/nalarms")({})

describe('nalarms', function() {
  it('Alarms controller', function() {
    AlarmsController.index({query: {plc: 1}}, {send: function(a, b) { console.log(a, b)}}, function() {
      console.log('ok');
    })
  })
})
