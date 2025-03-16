const Applet = imports.ui.applet;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;
const PopupMenu = imports.ui.popupMenu;

class AudioOutputToggler extends Applet.IconApplet {
  constructor(metadata, orientation, panelHeight, instanceId) {
    super(orientation, panelHeight, instanceId);

    this.set_applet_icon_symbolic_name("audio-speakers");
    this.set_applet_tooltip(_("Toggle Audio Output"));
    this.currentSink = "";

    //
    this.menuManager = new PopupMenu.PopupMenuManager(this);
    this.menu = new Applet.AppletPopupMenu(this, orientation);
    this.menuManager.addMenu(this.menu);

    this._selectOutputDeviceItem = new PopupMenu.PopupSubMenuMenuItem(
      _("Output device")
    );

    this.menu.addMenuItem(this._selectOutputDeviceItem);

    this._updateSink();
    this._buildMenu(); // Initial menu build
  }

  on_applet_clicked(event) {
    if (event.get_button() === 3) {
      this._buildMenu(); // Rebuild menu on right-click
      this.menu.toggle();
    } else {
      this._toggleSink();
    }
  }

  _updateSink() {
    this.currentSink = this._getDefaultSink();
    this.set_applet_tooltip(_(`Current Sink: ${this.currentSink}`));
  }

  _toggleSink() {
    let sinks = this._getSinks();
    if (sinks.length < 2) return;

    let currentIndex = sinks.findIndex(
      (sink) => sink.name === this.currentSink
    );
    let nextIndex = (currentIndex + 1) % sinks.length;
    let newSink = sinks[nextIndex].name;

    this._setSink(newSink);
  }

  _getSinks() {
    try {
      let [res, out] = GLib.spawn_command_line_sync("pactl list short sinks");
      if (!res) {
        global.logError("Error getting sinks: pactl failed");
        return [];
      }
      return String(out)
        .trim()
        .split("\n")
        .map((line) => {
          let parts = line.split("\t");
          return {
            index: parts[0],
            name: parts[1],
            description: parts.slice(2).join("\t").trim(),
          };
        });
    } catch (e) {
      global.logError("Exception in _getSinks: " + e);
      return [];
    }
  }

  _getDefaultSink() {
    try {
      let [res, out] = GLib.spawn_command_line_sync("pactl get-default-sink");
      if (!res) {
        global.logError("Error getting default sink: pactl failed");
        return "";
      }
      return String(out).trim();
    } catch (e) {
      global.logError("Exception in _getDefaultSink: " + e);
      return "";
    }
  }

  _setSink(sinkName) {
    try {
      Util.spawnCommandLine(`pactl set-default-sink ${sinkName}`);
      Util.spawnCommandLine(
        `pactl move-sink-input @DEFAULT_AUDIO_SINK@ ${sinkName}`
      );
    } catch (e) {
      global.logError("Exception in _setSink: " + e);
    }

    Mainloop.timeout_add(500, () => {
      this._updateSink();
      this._buildMenu();
      return false;
    });
  }

  _buildMenu() {
    this._selectOutputDeviceItem.menu.removeAll();
    let sinks = this._getSinks();

    sinks.forEach((sink) => {
      let item = new PopupMenu.PopupMenuItem(sink.description);
      item.connect("activate", () => {
        this._setSink(sink.name);
      });
      this._selectOutputDeviceItem.menu.addMenuItem(item);
    });
  }
}

function main(metadata, orientation, panelHeight, instanceId) {
  return new AudioOutputToggler(metadata, orientation, panelHeight, instanceId);
}
