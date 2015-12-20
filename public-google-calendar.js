var ical = require('ical')
  , RRule = require('rrule').RRule;

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
      , expandedEvents = []
      , properties = [                         // properties to include in result
          { name: 'start', type: 'object' },
          { name: 'end', type: 'object' },
          { name: 'status', type: 'string' },
          { name: 'summary', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'rrule', type: 'object' },
          { name: 'location', type: 'string' },
          { name: 'uid', newName: 'id', type: 'string'} ]
      , defaults = { expandRecurring: true, earliestFirst: false }
      , k
      , obj;

    // set default options
    for (k in defaults) {
      if (defaults.hasOwnProperty(k) && !(k in options)) {
        options[k] = defaults[k];
      }
    }

    // define sorting order ascending/descending
    var sortingModifier = options.earliestFirst ? -1 : 1;

    if (calendarId) {
      var url = 'https://www.google.com/calendar/ical/' + calendarId + '/public/basic.ics';

      ical.fromURL(url, {}, function(err, data) {

        var k;

        var iterator = function(prop) {
          var key = prop.newName ? prop.newName : prop.name;
          obj[key] = data[k][prop.name];
          if (prop.type === 'string') {
            obj[key] = typeof obj[key] === 'string' ? obj[key] : '';
          }
        };

        if (err) { return callback(err); }
        for (k in data) {
          if (data.hasOwnProperty(k) && data[k].type === 'VEVENT') {

            obj = {};
            properties.forEach(iterator);
            events.push(obj);
          }
        }

        // expand recurring events
        if (options.expandRecurring) {
          events.forEach(function (event) {

            var rule, eventLength;
            if (event.rrule) {

              // Ugly hack, because latest version of 'ical' is not yet in npm
              event.rrule.origOptions.dtstart = event.start;

              rule = new RRule(event.rrule.origOptions);

              eventLength = event.end ? event.end - event.start : 0;
              rule.all().slice(1).forEach(function (dateString) {

                var newObject = {}
                  , k;

                // TODO: Should make this property copying future proof
                for (k in event) {
                  if (event.hasOwnProperty(k) && typeof event[k] === 'string') {
                    newObject[k] = event[k];
                  }
                }
                newObject.start = new Date(dateString);
                if (eventLength) {
                  newObject.end = new Date(newObject.start.getTime() + eventLength);
                }
                expandedEvents.push(newObject);
              });
            }
          });
          events = events.concat(expandedEvents);
        }

        // sort events
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
