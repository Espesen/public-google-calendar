const PublicGoogleCalendar = require('./public-google-calendar');

const cal = new PublicGoogleCalendar({
  calendarId: 'ht3jlfaac5lfd6263ulfh4tql8@group.calendar.google.com' // Phases of the Moon
});

cal.getEvents({ earliestFirst: true }, (err, events) => {
  const today = new Date().toISOString();
  if (err) { return console.log(err); }
  events
    .filter(event => event.start.toISOString() > today)
    .slice(0, 8)
    .forEach(event => 
      console.log(event.start.toISOString(), event.summary));
});
