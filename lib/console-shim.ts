let consolelog = log;
let warn = global.logWarning;
let error = global.logError;
let trace = global.logTrace;
export {
  consolelog as "console.log",
  warn as "console.warn",
  error as "console.error",
  trace as "console.trace",
};
