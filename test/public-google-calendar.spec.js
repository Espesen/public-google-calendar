

// a sample calendar for testing
var calendarId = '199slga5i4eh632182h41sr98g@group.calendar.google.com';

// data in sample calendar
var repeatingEvents = [
  { name: 'Repeating event 1', count: 10, found: [] },
  { name: 'Repeating event 2', count: 5, found: [] }
];

var PublicGoogleCalendar = require('../public-google-calendar')
  //, RRule = require('rrule').RRule
  , cal = new PublicGoogleCalendar({ calendarId: calendarId });

describe('public-google-calendar.js', function () {

  describe('method getJSON', function () {

    it('should get calendar data and convert it to JSON', function (done) {

      var callback = function(err, events) {
        expect(err).toBe(null);
        if (err) { return done(err); }
        expect(events.length).toBeTruthy();
        events.forEach(function(event) {
          ['start', 'end', 'status', 'summary', 'description', 'location']
            .forEach(function(prop) { expect(prop in event).toBeTruthy(); });
        });
        done();
      };

      cal.getEvents(callback);
    }, 30000);

    var sortingTestCallback = function(ascending, done) {
      return function (err, events) {
        expect(err).toBe(null);
        if (err) { return done(err); }
        events.forEach(function(event, index) {
          if (index > 0) {
            if (ascending) {
              expect(event.start).toBeGreaterThan(events[index - 1].start);
            }
            else {
              expect(event.start).toBeLessThan(events[index - 1].start);
            }
          }
        });
        done();
      };
    };

    it('should return date-sorted data, by default latest event first', function(done) {
      cal.getEvents(sortingTestCallback(false, done));
    }, 30000);

    it('should return date-sorted data, earliest event first if required', function(done) {
      cal.getEvents({ earliestFirst: true }, sortingTestCallback(true, done));
    }, 30000);

    it('should expand recurring events', function (done) {
      cal.getEvents(function(err, data) {
        if (err) { return done(err); }

        data.forEach(function(item) {
          repeatingEvents.forEach(function(event) {
            if (item.summary === event.name) { event.found.push(item); }
          });
        });

        repeatingEvents.forEach(function(event) {
          expect(event.count).toBe(event.found.length);
        });

        done(null);
      });
    });

  });
});