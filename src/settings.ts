import type { Settings } from "../lib/settings-schema";

export const settings: Settings = {
  section1: {
    type: "section",
    description: "Menu",
  },
  toggleKey: {
    type: "keybinding",
    description: "Audio Toggle",
    default: "<Super>l",
    tooltip: "Set keybinding(s) to toggle active audio device.",
  },
  outputDeviceA: {
    type: "entry",
    default: "",
    description: "Output Device A",
    tooltip: "Output Device A",
  },
  outputDeviceB: {
    type: "entry",
    default: "",
    description: "Output Device B",
    tooltip: "Output Device B",
  },
};
