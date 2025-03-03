const Applet = imports.ui.applet;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;
const PopupMenu = imports.ui.popupMenu;

class AudioOutputToggler extends Applet.TextIconApplet {
  constructor(metadata, orientation, panelHeight, instanceId) {
    super(orientation, panelHeight, instanceId);

    this.set_applet_icon_symbolic_name("audio-speakers");
    this.set_applet_tooltip("Toggle Audio Output");
    this.currentSink = "";

    this.menuManager = new PopupMenu.PopupMenuManager(this);
    this.menu = new Applet.AppletPopupMenu(this, orientation);
    this.menuManager.addMenu(this.menu);

    this._updateSink();
    this._buildMenu();
  }

  on_applet_clicked(event) {
    if (event.get_button() === 3) {
      this.menu.toggle();
    } else {
      this._toggleSink();
    }
  }

  _getSinks() {
    let [res, out] = GLib.spawn_command_line_sync("pactl list short sinks");
    if (!res) return [];
    return String(out)
      .trim()
      .split("\n")
      .map((line) => {
        let parts = line.split("\t");
        return {
          id: parts[0],
          name: parts[1],
          description: parts.slice(2).join("\t").trim(),
        };
      });
  }

  _getDefaultSink() {
    let [res, out] = GLib.spawn_command_line_sync("pactl get-default-sink");
    return res ? String(out).trim() : "";
  }

  _updateSink() {
    this.currentSink = this._getDefaultSink();
    this.set_applet_tooltip(`Current Sink: ${this.currentSink}`);
  }

  _toggleSink() {
    let sinks = this._getSinks();
    if (sinks.length < 2) return;

    let currentIndex = sinks.findIndex(
      (sink) => sink.name === this.currentSink
    );
    let nextIndex = (currentIndex + 1) % sinks.length;
    let newSink = sinks[nextIndex].name;

    Util.spawnCommandLine(`pactl set-default-sink ${newSink}`);
    Util.spawnCommandLine(
      `pactl move-sink-input @DEFAULT_AUDIO_SINK@ ${newSink}`
    );

    Mainloop.timeout_add(500, () => {
      this._updateSink();
      this._buildMenu();
      return false;
    });
  }

  _buildMenu() {
    this.menu.removeAll();
    let sinks = this._getSinks();

    sinks.forEach((sink) => {
      let item = new PopupMenu.PopupMenuItem(
        `${sink.description} (${sink.name})`
      );
      item.connect("activate", () => {
        Util.spawnCommandLine(`pactl set-default-sink ${sink.name}`);
        Util.spawnCommandLine(
          `pactl move-sink-input @DEFAULT_AUDIO_SINK@ ${sink.name}`
        );
        Mainloop.timeout_add(500, () => {
          this._updateSink();
          this._buildMenu();
          return false;
        });
      });
      this.menu.addMenuItem(item);
      item.setShowDot(sink.name === this.currentSink);
    });
  }
}

function main(metadata, orientation, panelHeight, instanceId) {
  return new AudioOutputToggler(metadata, orientation, panelHeight, instanceId);
}
