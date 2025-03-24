import { existsSync, readFileSync, statSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json").toString()) as {
  appletName: string;
  version: string;
};

export function getExtensionName() {
  return pkg.appletName;
}

export function getVersion() {
  return pkg.version;
}

export function folderExists(folderPath: string) {
  try {
    if (existsSync(folderPath)) {
      const stats = statSync(folderPath);
      return stats.isDirectory();
    }
    return false;
  } catch (err) {
    console.error("An error occurred:", err);
    return false;
  }
}
