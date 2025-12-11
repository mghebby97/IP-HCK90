const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../server.log');

const log = (msg) => {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(line);
};

module.exports = { log, logFile };
