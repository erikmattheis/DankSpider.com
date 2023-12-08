const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'your-service-name' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `quick-start-combined.log`.
    // - Write all logs error (and below) to `quick-start-error.log`.
    //
    new transports.File({ filename: '../temp/errors.log', level: 'error' }),
    new transports.File({ filename: 'warnings.log', level: 'warn' }),
    new transports.File({ filename: 'info.log', level: 'info' }),
  ]
});

//
// If we're not in production then **ALSO** log to the `logger`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(transports.logger({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

/*
// ***************
// Allows for parameter-based logging
// ***************

logger.log('info', 'Pass a message and this works', {
  additional: 'properties',
  are: 'passed along'
});

logger.info('Use a helper method if you want', {
  additional: 'properties',
  are: 'passed along'
});

// ***************
// Allows for string interpolation
// ***************

// info: test message my string {}
logger.log('info', 'test message %s', 'my string');


// info: test message first second {number: 123}
logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });
*/

module.exports = logger;