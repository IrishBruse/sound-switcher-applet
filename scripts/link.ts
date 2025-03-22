import { symlinkSync } from "fs";
import path from "path";
import { getExtensionFolder } from "./utilities";

const extensionName = getExtensionFolder();

try {
  symlinkSync(
    path.resolve("./" + extensionName),
    process.env.HOME + "/.local/share/cinnamon/applets/" + extensionName,
    "dir"
  );
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
