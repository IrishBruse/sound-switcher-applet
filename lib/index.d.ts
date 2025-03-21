/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="imports.d.ts"/>

declare const console = {
  log: global.log,
  warn: global.logWarning,
  error: global.logError,
  trace: global.logTrace,
};

function _(s: string): string;
