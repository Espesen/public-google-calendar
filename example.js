// Example

const PublicGoogleCalendar = require('./public-google-calendar');

// Create new calendar instance
const cal = new PublicGoogleCalendar({
  calendarId: 'ht3jlfaac5lfd6263ulfh4tql8@group.calendar.google.com' // Phases of the Moon
});

// Retrieve events and print the next eight Moon phases
cal.getEvents({ earliestFirst: true }, (err, events) => {
  const today = new Date().toISOString();
  if (err) {
    return console.log(err);
  }

  events

    // filter past events
    .filter(event => event.start.toISOString() > today)

    // select eight
    .slice(0, 8)

    // and print
    .forEach(event => 
      console.log(event.start.toISOString(), event.summary));
});
