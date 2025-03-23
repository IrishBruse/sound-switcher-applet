declare namespace imports.ui.settings {
  interface XletSettingsBase {
    bind(
      key: keyof typeof import("../src/settings").settings,
      applet_prop: string
    ): boolean;
    bind(
      key: keyof typeof import("../src/settings").settings,
      applet_prop: string,
      callback: () => void
    ): boolean;
  }
}
