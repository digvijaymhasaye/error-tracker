# Error Tracker Node.js App

This project implements a custom error tracking and logging tool similar to Sentry/Datadog.

## Features

- Logger with tagging, logs to terminal and hourly/tagged log files
- Tracks uncaught exceptions and sends email notifications with file, function, message, datetime, and stack trace

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Configure SMTP in `error-tracker.js` (replace with your email credentials)
3. Run the app:
   ```sh
   node index.js
   ```

## Example

See `index.js` for usage.
