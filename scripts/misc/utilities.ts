import { existsSync, readFileSync, statSync } from "fs";

export function getExtensionName() {
  const pkg = JSON.parse(readFileSync("./package.json").toString()) as {
    appletName: string;
  };

  return pkg.appletName;
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
    return false; // Handle errors gracefully, consider logging.
  }
}
