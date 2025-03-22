import { readFileSync } from "fs";

export function getExtensionFolder() {
  const pkg = JSON.parse(readFileSync("./package.json").toString()) as {
    name: string;
    author: string;
  };

  const extensionName = pkg.name + "@" + pkg.author;

  return extensionName;
}
