//! https://github.com/IrishBruse/sound-switcher-applet
const consoleLog = global.log;
const consoleWarn = global.logWarning;
const consoleError = global.logError;
const consoleTrace = global.logTrace;
const t = (val) => {
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
