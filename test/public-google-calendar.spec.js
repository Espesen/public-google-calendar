

// a sample calendar for testing
var calendarId = '8q48qdcs88hl59kei3oaq5kqq4@group.calendar.google.com';

var PublicGoogleCalendar = require('../public-google-calendar')
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

  });
});