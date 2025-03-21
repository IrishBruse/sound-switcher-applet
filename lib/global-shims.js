let consoleLog = global.log;
let consoleWarn = global.logWarning;
let consoleError = global.logError;
let consoleTrace = global.logTrace;
let t = (val) => {
  // global.log("Translate: " + val);
  return _(val);
};
export {
  consoleLog as "console.log",
  consoleWarn as "console.warn",
  consoleError as "console.error",
  consoleTrace as "console.trace",
  t as "_",
};
