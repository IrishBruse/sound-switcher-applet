import { symlinkSync } from "fs";
import path from "path";
import { getExtensionName } from "./misc/utilities";

const extensionName = getExtensionName();

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
