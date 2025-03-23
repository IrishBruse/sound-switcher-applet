const consoleLog = () => {};
const consoleTrace = () => {};
const consoleWarn = global.logWarning;
const consoleError = global.logError;
const t = _;
export {
  consoleLog as "console.log",
  consoleWarn as "console.warn",
  consoleError as "console.error",
  consoleTrace as "console.trace",
  t as "_",
};
