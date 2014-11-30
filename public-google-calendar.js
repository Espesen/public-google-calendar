var ical = require('ical');

module.exports = function PublicGoogleCalendar(args) {

  // args: {
  //    calendarId: Google calendar ID
  // }

  var calendarId = args.calendarId;

  this.getEvents = function(options, callback) {
    // Retrieves Google Calendar events in ical format and converts data to simple JSON form
    // Calendar events are sorted (latest event first)
    // callback is called with error and array of events

    if (!callback) {
      callback = options;
      options = {};
    }

    var events = []
      , properties = ['start', 'end', 'status', 'summary', 'description', 'location'] // properties to include in result
      , obj;

    // define sorting order ascending/descending
    var sortingModifier = options.earliestFirst ? -1 : 1;

    if (calendarId) {
      var url = 'https://www.google.com/calendar/ical/' + calendarId + '/public/basic.ics';

      ical.fromURL(url, {}, function(err, data) {

        var iterator = function(prop) {
          obj[prop] = data[k][prop];
        };

        if (err) { return callback(err); }
        for (var k in data) {
          if (data.hasOwnProperty(k) && data[k].type === 'VEVENT') {
            obj = {};
            properties.forEach(iterator);
            events.push(obj);
          }
        }

        events.sort(function(a, b) {
            if (a.start > b.start) {
              return -1 * sortingModifier;
            }
            else {
              return sortingModifier;
            }
          });

        callback(null, events);
      });

    }
    else {
      callback(new Error('Missing calendarId'));
    }

  };


};
