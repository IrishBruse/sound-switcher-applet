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

global.log("\n".repeat(20));

class AudioOutputToggler extends Applet.IconApplet {
  devices = {};

  constructor(metadata, orientation, panelHeight, instanceId) {
    super(orientation, panelHeight, instanceId);

    this.setAllowedLayout(Applet.AllowedLayout.BOTH);

    this.metadata = metadata;
    this.settings = new Settings.AppletSettings(
      this,
      metadata.uuid,
      instanceId
    );

    this.settings.bind("outputOriginA", "outputOriginA");
    this.settings.bind("outputDescriptionA", "outputDescriptionA");

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
      const device = this.devices[id];
      device.item.setShowDot(true);

      global.log(device.description);
      global.log(device.origin);

      this.settings.setValue("outputDescriptionA", device.description);
      this.settings.setValue("outputOriginA", device.origin);
    });

    let label = new St.Label({
      text: device.origin,
      x_align: Clutter.ActorAlign.END,
    });
    item.addActor(label, { expand: true });

    this.outputDevicesFold.menu.addMenuItem(item);
    this.outputDevicesFold.actor.show();

    this.devices[id] = {
      id,
      description: device.description,
      origin: device.origin,
      item,
    };
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

    this._control.change_output(this.devices[id]);
  }
}

function main(metadata, orientation, panelHeight, instanceId) {
  return new AudioOutputToggler(metadata, orientation, panelHeight, instanceId);
}
