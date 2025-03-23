import path from "path";
import { folderExists, getExtensionName } from "./misc/utilities";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { info } from "../src/info";

const extensionName = getExtensionName();

const extensionDir = (...files: string[]) =>
  path.join("../cinnamon-spices-applets/", extensionName, ...files);

const buildDir = (...files: string[]) =>
  extensionDir("files", extensionName, ...files);

if (!folderExists(path.resolve("../cinnamon-spices-applets/"))) {
  console.log(
    "Missing repo https://github.com/linuxmint/cinnamon-spices-applets at ../cinnamon-spices-applets/ "
  );
}

rmSync(extensionDir(), { recursive: true, force: true });

console.log("Output:", buildDir());

mkdirSync(buildDir(), {
  recursive: true,
});

cpSync("./" + extensionName, buildDir(), { recursive: true });
cpSync("./screenshot.png", extensionDir("/screenshot.png"));
cpSync("./Readme.md", extensionDir("/README.md"));

cpSync("./icon.png", extensionDir("/icon.png"));
cpSync("./icon.png", buildDir("/icon.png"));

writeFileSync(extensionDir("info.json"), JSON.stringify(info, null, 4));
