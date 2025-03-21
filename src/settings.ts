import type { Settings } from "../lib/settings-schema";

export const settings: Settings = {
  section1: {
    type: "section",
    description: "Menu",
  },
  keyOpen: {
    type: "keybinding",
    description: "Show menu",
    default: "<Super>k",
    tooltip: "Set keybinding(s) to show the sound applet menu.",
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
