

// a sample calendar for testing
var calendarId = '199slga5i4eh632182h41sr98g@group.calendar.google.com';

// data in sample calendar
var repeatingEvents = [
  { name: 'Repeating event 1', count: 10 },
  { name: 'Repeating event 2', count: 5 }
];

var PublicGoogleCalendar = require('../public-google-calendar')
  //, RRule = require('rrule').RRule
  , cal = new PublicGoogleCalendar({ calendarId: calendarId });

describe('public-google-calendar.js', function () {

  describe('method getEvents', function () {

    it('should get calendar data and convert it to JSON', function (done) {

      var callback = function(err, events) {
        expect(err).toBe(null);
        if (err) { return done(err); }
        expect(events.length).toBeTruthy();
        events.forEach(function(event) {
          ['start', 'end', 'status', 'summary', 'description', 'location', 'id']
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
              expect(event.start).not.toBeLessThan(events[index - 1].start);
            }
            else {
              expect(event.start).not.toBeGreaterThan(events[index - 1].start);
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

    it('should by default omit events more than three years in the future', function(done) {

      var date = new Date();
      date.setYear(date.getFullYear() + 3);
      endDate = date.getTime();

      cal.getEvents(function (err, data) {
        if (err) { return done(err); }
        data.forEach(function (event) {
          expect(event.start.getTime()).toBeLessThan(endDate);
        });
        done();
      });
    }, 30000);

    it('should accept option "endDate"', function (done) {
      var date = new Date();
      date.setYear(date.getFullYear() + 1);
      endDate = date.getTime();

      cal.getEvents({ endDate: endDate }, function (err, data) {
        if (err) { return done(err); }
        data.forEach(function (event) {
          expect(event.start.getTime()).toBeLessThan(endDate);
        });
        done();
      });
    }, 30000);

    it('should by default expand recurring events', function (done) {
      cal.getEvents(function(err, data) {
        if (err) { return done(err); }

        repeatingEvents.forEach(function(event) { event.found = []; });

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

    it('should not expand recurring events when "expandRecurring" is set to false', function (done) {
      cal.getEvents({ expandRecurring: false }, function(err, data) {
        if (err) { return done(err); }

        repeatingEvents.forEach(function(event) { event.found = []; });

        data.forEach(function (item) {
          repeatingEvents.forEach(function (event) {
            if (item.summary === event.name ) { event.found.push(item); }
          });
        });

        repeatingEvents.forEach(function (event) {
          expect(event.found.length).toBe(1);
        });
        done(null);
      });
    });

    describe('expanded events', function () {
      it('should contain reference to the base event of the series', function (done) {

        var eventSummary = repeatingEvents[0].name
          , series = [];

        cal.getEvents({ earliestFirst: true }, function (err, data) {
          if (err) { return done(err); }
          data.forEach(function (item) {
            if (item.summary === eventSummary) { series.push(item); }
          });

          expect(series.length).toBe(repeatingEvents[0].count);

          series.slice(1).forEach(function (item) {
            expect(item.baseEvent.start).toBe(series[0].start);
          });
          done(null);
        });
      });
    });

  });
});