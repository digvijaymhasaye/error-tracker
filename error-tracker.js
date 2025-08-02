const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;
const fs = require('fs');
const path = require('path');
const stackTrace = require('stack-trace');
const nodemailer = require('nodemailer');
const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');

// Log directory
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom log format
const logFormat = printf(({ level, message, tag, timestamp }) => {
  return `${timestamp} [${level}]${tag ? ' [' + tag + ']' : ''}: ${message}`;
});

// Logger factory
function getLogger(tag = 'default') {
  const logFile = path.join(logDir, `${tag}-${new Date().toISOString().slice(0, 13)}.log`); // hourly rotation
  return createLogger({
    level: 'info',
    format: combine(
      timestamp(),
      format((info) => { info.tag = tag; return info; })(),
      logFormat
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: logFile })
    ]
  });
}


// AWS SES configuration (update region and credentials as needed)
const ses = new SESv2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Nodemailer SES transport
const transporter = nodemailer.createTransport({
  SES: { sesClient: ses, SendEmailCommand }
});

function sendErrorEmail({ file, func, message, datetime, stack }) {
  console.info('Sending email');
  const mailOptions = {
    from: process.env.SENDER_EMAIL, // Must be a verified SES email address
    to: process.env.DEVELOPER_EMAIL,
    subject: `Uncaught Exception in ${file}`,
    text: `Error in file: ${file}\nFunction: ${func}\nMessage: ${message}\nDatetime: ${datetime}\nStack Trace:\n${stack}`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Error notification sent:', info.response);
    }
  });
}

// Global error handler
process.on('uncaughtException', (err) => {
  const trace = stackTrace.parse(err)[0];
  const file = trace.getFileName();
  const func = trace.getFunctionName() || '<anonymous>';
  const message = err.message;
  const datetime = new Date().toISOString();
  const stack = err.stack;
  sendErrorEmail({ file, func, message, datetime, stack });
  const logger = getLogger('error');
  logger.error(`Uncaught Exception in ${file} [${func}]: ${message}\n${stack}`);
  // Do not exit the process immediately to allow async email to send
});

module.exports = { getLogger };
