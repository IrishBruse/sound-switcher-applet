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
  outputOriginA: {
    type: "entry",
    default: "",
    description: "Output Device A Origin",
    tooltip: "Output Device A Origin",
  },
  outputDescriptionA: {
    type: "entry",
    default: "",
    description: "Output Device A Description",
    tooltip: "Output Device A Description",
  },
  outputOriginB: {
    type: "entry",
    default: "",
    description: "Output Device B Origin",
    tooltip: "Output Device B Origin",
  },
  outputDescriptionB: {
    type: "entry",
    default: "",
    description: "Output Device B Description",
    tooltip: "Output Device B Description",
  },
};
