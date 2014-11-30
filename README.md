###public-google-calendar

Module for NodeJS. Retrieves all events from a public Google Calendar and returns them
date-sorted in a simplified object.

#####Installation:

```
npm install public-google-calendar
```

#####Example:

```
var PublicGoogleCalendar = require('public-google-calendar')
  , publicGoogleCalendar = new PublicGoogleCalendar({ calendarId: 'id-of-public-google-calendar' });
  
publicGoogleCalendar.getJSON(function(err, events) {
  if (err) { return console.log(err.message); }
  // events is now array of all calendar events
});
```

#####API:

*publicGoogleCalendar.getEvents(options, callback)*

By default, returns a date-sorted array (latest event first) of Google Calendar events.

Options (optional): set `earliestFirst` true to reverse sort order.
Callback: called with arguments `error` and `events`, an array of objects with following properties:
  `summary`: string
  `location`: string
  `status`: string
  `description`: string
  `start`: Date object
  `end`: Date object

#####Testing:

Run tests with Grunt:

```
grunt jasmine_node
```









