import "./overrides";
import "./imports";

declare type Console = {
  log: typeof global.log;
  warn: typeof global.logWarning;
  error: typeof global.logError;
  trace: typeof global.logTrace;
};

declare global {
  const console: Console;
  function _(s: string): string;
}
