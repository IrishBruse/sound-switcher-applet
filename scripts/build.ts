/* eslint-disable @typescript-eslint/no-unused-vars */
import { build, BuildOptions, Plugin } from "esbuild";
import { cpSync, mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { metadata } from "../src/metadata";
import { settings } from "../src/settings";
import { exec } from "child_process";
import { getExtensionName, getVersion } from "./misc/utilities";
import { argv } from "process";
import { cjsPlugin } from "./misc/cjsPlugin";

const isProd = argv.includes("--production");

const extensionName = getExtensionName();
const version = getVersion();

try {
  mkdirSync(extensionName);
} catch (error) {
  //
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(metadata as any).version = version;

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

cpSync("src/po", extensionName + "/po", { recursive: true });
cpSync("icon.png", extensionName + "/icon.png");

exec(
  `dbus-send --session --dest=org.Cinnamon.LookingGlass --type=method_call /org/Cinnamon/LookingGlass org.Cinnamon.LookingGlass.ReloadExtension string:${extensionName} string:'APPLET'`
);
