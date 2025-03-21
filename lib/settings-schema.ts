export type Settings = Record<string, Setting>;

type Setting =
  | ButtonSetting
  | CheckboxSetting
  | SwitchSetting
  | ColorChooserSetting
  | ComboSetting
  | CustomSetting
  | EntrySetting
  | FileChooserSetting
  | GenericSetting
  | IconFileChooserSetting
  | KeybindingSetting
  | LayoutSetting
  | ListSetting
  | RadioSetting
  | ScaleSetting
  | SectionHeaderSetting
  | SoundFileChooserSetting
  | SpinButtonSetting
  | TextViewSetting;

type BaseSetting = {
  description?: string;
  tooltip?: string;
  indent?: boolean;
  dependency?: string;
};

type BaseDefaultSetting = BaseSetting & {
  default: string;
};

type Range = {
  min?: number;
  max?: number;
  step?: number;
  units?: string;
};

type SectionHeaderSetting = {
  type: "section" | "header" | "label" | "separator";
} & BaseSetting;

type CheckboxSetting = {
  type: "checkbox";
  default: boolean;
} & BaseDefaultSetting;

type SwitchSetting = {
  type: "switch";
  default: boolean | 1 | 0;
} & BaseDefaultSetting;

type IconCatagory = {
  name: string;
  icons: string[];
};

type IconFileChooserSetting = {
  type: "iconfilechooser";
  icon_categories?: IconCatagory[];
  default_category?: string;
  default_icon?: string;
} & BaseDefaultSetting;

type KeybindingSetting = {
  type: "keybinding";
} & BaseDefaultSetting;

type FileChooserSetting = {
  type: "filechooser";
  "select-dir"?: boolean;
  "allow-none"?: boolean;
} & BaseDefaultSetting;

type SoundFileChooserSetting = {
  type: "soundfilechooser";
  "event-sounds"?: boolean;
} & BaseDefaultSetting;

type ColorChooserSetting = {
  type: "colorchooser";
} & BaseDefaultSetting;

type CustomSetting = {
  type: "custom";
  file: string;
  widget: string;
  default?: unknown;
} & BaseSetting;

type RadioSetting = {
  type: "radiogroup";
  options: Record<string, string | number>;
  default?: string | number;
} & BaseDefaultSetting;

type ComboSetting = {
  type: "combobox";
  options: Record<string, string | number>;
  value?: string | number;
  default?: string | number;
} & BaseSetting &
  Range;

type TextViewSetting = {
  type: "textview";
  height: number;
} & BaseDefaultSetting;

type SpinButtonSetting = {
  type: "spinbutton";
  default: number;
  options?: Record<string, number>;
} & BaseDefaultSetting &
  Required<Range>;

type EntrySetting = {
  type: "entry";
  default: string | number;
} & BaseDefaultSetting &
  Range;

type ScaleSetting = {
  type: "scale";
  default: string | number;
  "show-value"?: boolean;
} & BaseDefaultSetting &
  Range;

type ButtonSetting = {
  type: "button";
  callback: string;
} & BaseSetting;

type GenericSetting = {
  type: "generic";
  default?: any;
  [key: string]: any; // can i move
} & BaseDefaultSetting;

type ListSetting = {
  type: "list";
  columns: Column[];
  default: any[];
  "show-buttons"?: boolean;
  width?: number;
  height?: number;
} & BaseSetting;

type Column = {
  id: string;
  title: string;
  type:
    | "boolean"
    | "keybinding"
    | "float"
    | "integer"
    | "string"
    | "icon"
    | "file";
  default?: any;
  align?: number;
  options?: Record<string, string | number>;
  "select-dir"?: boolean;
} & Range;

type LayoutSetting = {
  type: "layout";
  width?: number;
  height?: number;
  pages: string[];
  [key: string]: {};
} & BaseSetting;
