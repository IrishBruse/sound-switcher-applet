/* eslint-disable @typescript-eslint/no-unused-vars */
import { build, BuildOptions, Plugin } from "esbuild";
import { mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { metadata } from "../src/metadata";
import { settings } from "../src/settings";
import { exec } from "child_process";
import { getExtensionName } from "./misc/utilities";
import { argv } from "process";
import { cjsPlugin } from "./misc/cjsPlugin";

const isProd = argv.includes("--production");

const extensionName = getExtensionName();

try {
  mkdirSync(extensionName);
} catch (error) {
  //
}

const metadataJson = JSON.stringify(metadata, null, 2);
await writeFile(extensionName + "/metadata.json", metadataJson);

const settingsJson = JSON.stringify(settings, null, 2);
await writeFile(extensionName + "/settings-schema.json", settingsJson);

const config: BuildOptions = {
  entryPoints: ["src/applet.ts"],
  target: "es2017",
  sourcemap: false,
  minify: false,
  treeShaking: false,
  banner: {
    js: "//\n// Generated from https://github.com/IrishBruse/sound-switcher-applet\n//",
  },
  logLevel: "info",
  plugins: [cjsPlugin],
  outdir: "./" + extensionName,
  inject: [isProd ? "./lib/global-shims.prod.js" : "./lib/global-shims.js"],
};

await build(config);

exec(
  `dbus-send --session --dest=org.Cinnamon.LookingGlass --type=method_call /org/Cinnamon/LookingGlass org.Cinnamon.LookingGlass.ReloadExtension string:${extensionName} string:'APPLET'`
);
