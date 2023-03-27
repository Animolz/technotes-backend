const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const logEvent = async (message, logFileName) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  const logsPath = (fileName) => {
    if (fileName) {
      return path.join(__dirname, "..", "logs", fileName);
    }
    return path.join(__dirname, "..", "logs");
  };

  try {
    if (!fs.existsSync(logsPath())) {
      await fsPromises.mkdir(logsPath());
    }
    await fsPromises.appendFile(logsPath(logFileName), logItem);
  } catch (err) {
    console.log(err);
  }
};

const logger = (req, res, next) => {
  logEvent(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  console.log(`${req.method} ${req.path}`);

  next();
};

module.exports = { logEvent, logger };
