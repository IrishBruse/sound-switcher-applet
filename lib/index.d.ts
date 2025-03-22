/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="imports.d.ts"/>

declare type Console = {
  log: typeof global.log;
  warn: typeof global.logWarning;
  error: typeof global.logError;
  trace: typeof global.logTrace;
};

declare const console: Console;

declare function _(s: string): string;
