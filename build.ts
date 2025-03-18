/// <reference types="node" />

import { build, BuildOptions, Plugin } from "esbuild";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";
import { metadata } from "./src/metadata";
import { settings } from "./src/settings";
import { exec } from "child_process";

const pkg = JSON.parse(readFileSync("./package.json").toString());
const extensionName = pkg.name + "@" + pkg.author;

const metadataJson = JSON.stringify(metadata, null, 2);
writeFile(extensionName + "/metadata.json", metadataJson);

const settingsJson = JSON.stringify(settings, null, 2);
writeFile(extensionName + "/settings-schema.json", settingsJson);

let envPlugin: Plugin = {
  name: "cinnamon-cjs",
  setup(build) {
    // Intercept import paths called "env" so esbuild doesn't attempt
    // to map them to a file system location. Tag them with the "env-ns"
    // namespace to reserve them for this plugin.
    build.onResolve({ filter: /^env$/ }, (args) => ({
      path: args.path,
      namespace: "cinnamon-cjs",
    }));

    // Load paths tagged with the "env-ns" namespace and behave as if
    // they point to a JSON file containing the environment variables.
    build.onLoad({ filter: /.*/, namespace: "env-ns" }, () => ({
      contents: JSON.stringify(process.env),
      loader: "json",
    }));
  },
};

const config: BuildOptions = {
  entryPoints: ["src/applet.ts"],
  bundle: true,
  platform: "node",
  target: "es2017",
  sourcemap: false,
  minify: false,
  treeShaking: false,
  external: ["gi"],
  logLevel: "info",
  plugins: [envPlugin],
  outdir: "./" + extensionName,
  inject: ["./lib/console-shim.js"],
};

build(config);

exec(
  `dbus-send --session --dest=org.Cinnamon.LookingGlass --type=method_call /org/Cinnamon/LookingGlass org.Cinnamon.LookingGlass.ReloadExtension string:${extensionName} string:'APPLET'`
);
