//
const Applet = imports.ui.applet;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Gio = imports.gi.Gio;
const Interfaces = imports.misc.interfaces;
const Util = imports.misc.util;
const Cinnamon = imports.gi.Cinnamon;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Cvc = imports.gi.Cvc;
const Tooltips = imports.ui.tooltips;
const Main = imports.ui.main;
const Settings = imports.ui.settings;
const Slider = imports.ui.slider;
const Pango = imports.gi.Pango;

global.log("\n".repeat(50));

class AudioOutputToggler extends Applet.IconApplet {
  devices = {};

  constructor(metadata, orientation, panelHeight, instanceId) {
    super(orientation, panelHeight, instanceId);

    this.set_applet_icon_symbolic_name("audio-speakers");
    this.set_applet_tooltip(_("Toggle Audio Output"));
    this.currentSink = "";

    this.menuManager = new PopupMenu.PopupMenuManager(this);
    this.menu = new Applet.AppletPopupMenu(this, orientation);
    this.menuManager.addMenu(this.menu);

    this.outputDevicesFold = new PopupMenu.PopupSubMenuMenuItem(
      _("Output device")
    );

    // Add sink selection to the context menu instead of applet menu
    this._applet_context_menu.addMenuItem(this.outputDevicesFold);

    this.menu.addMenuItem(this.outputDevicesFold);

    this._control = new Cvc.MixerControl({ name: "Cinnamon Volume Control" });
    this._control.connect("output-added", (...args) =>
      this.onDeviceOutputAdded(...args)
    );
    this._control.connect("output-removed", (...args) =>
      this.onDeviceOutputRemoved(...args)
    );
    this._control.connect("active-output-update", (...args) =>
      this.onDeviceOutputUpdate(...args)
    );

    this._control.open();
  }

  onDeviceOutputAdded(control, id) {
    let device = this._control.lookup_output_id(id);

    let item = new PopupMenu.PopupMenuItem(device.description);

    item.connect("activate", () => {
      global.log("activate");
      this.devices[id].item.setShowDot(true);
    });

    let label = new St.Label({
      text: device.origin,
      x_align: Clutter.ActorAlign.END,
    });
    item.addActor(label, { expand: true });

    this.outputDevicesFold.menu.addMenuItem(item);
    this.outputDevicesFold.actor.show();

    this.devices[id] = { ...device, item };
  }

  onDeviceOutputRemoved(control, id) {
    if (this.devices[id]) {
      this.devices[id].item.destroy();
    }
    delete this.devices[id];
  }

  onDeviceOutputUpdate(control, id) {
    this.devices[id].item.setShowDot(id === this.devices[i].id);
  }

  on_applet_clicked(event) {
    global.log("click");
  }

  _updateSink() {
    // this.currentSink = this._getDefaultSinkDescription();
    this.set_applet_tooltip(_(`Current Sink: ${this.currentSink}`));
  }

  _toggleSink() {
    // let sinks = this._getSinks();
    // if (sinks.length < 2) {
    //   return;
    // }
    // let currentIndex = sinks.findIndex(
    //   (sink) => sink.description === this.currentSink
    // );
    // let nextIndex = (currentIndex + 1) % sinks.length;
    // let newSink = sinks[nextIndex].name;
    // this._setSink(newSink);
  }
}

function main(metadata, orientation, panelHeight, instanceId) {
  return new AudioOutputToggler(metadata, orientation, panelHeight, instanceId);
}
