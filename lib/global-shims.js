const consoleLog = global.log;
const consoleTrace = global.logTrace;
const consoleWarn = global.logWarning;
const consoleError = global.logError;

export {
  consoleLog as "console.log",
  consoleWarn as "console.warn",
  consoleError as "console.error",
  consoleTrace as "console.trace",
};
