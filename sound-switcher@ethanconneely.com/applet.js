"use strict";

// lib/console-shim.ts
var consolelog = log;
var warn = global.logWarning;
var error = global.logError;
var trace = global.logTrace;

// src/applet.ts
var Applet = imports.ui.applet;
var Lang = imports.lang;
var Mainloop = imports.mainloop;
var Gio = imports.gi.Gio;
var Interfaces = imports.misc.interfaces;
var Util = imports.misc.util;
var Clutter = imports.gi.Clutter;
var St = imports.gi.St;
var PopupMenu = imports.ui.popupMenu;
var GLib = imports.gi.GLib;
var Cvc = imports.gi.Cvc;
var Tooltips = imports.ui.tooltips;
var Main = imports.ui.main;
var Settings = imports.ui.settings;
var Slider = imports.ui.slider;
var Pango = imports.gi.Pango;
consolelog("test");
var AudioOutputToggler = class extends Applet.IconApplet {
  constructor(metadata, orientation, panelHeight, instanceId) {
    super(orientation, panelHeight, instanceId);
    this.selectedDevice = {
      A: -1,
      B: -1
    };
    this.devices = {};
    this.setAllowedLayout(Applet.AllowedLayout.BOTH);
    this.metadata = metadata;
    this.settings = new Settings.AppletSettings(
      this,
      metadata.uuid,
      instanceId
    );
    this.settings.bind("outputOriginA", "outputOriginA");
    this.settings.bind("outputDescriptionA", "outputDescriptionA");
    this.settings.bind("outputOriginB", "outputOriginB");
    this.settings.bind("outputDescriptionB", "outputDescriptionB");
    this.set_applet_icon_symbolic_name("audio-speakers");
    this.set_applet_tooltip(_("Toggle Audio Output"));
    this.menuManager = new PopupMenu.PopupMenuManager(this);
    this.menu = new Applet.AppletPopupMenu(this, orientation);
    this.menuManager.addMenu(this.menu);
    this.outputDevicesADropdown = new PopupMenu.PopupSubMenuMenuItem(
      _("Output A")
    );
    this._applet_context_menu.addMenuItem(this.outputDevicesADropdown);
    this.menu.addMenuItem(this.outputDevicesADropdown);
    this.outputDevicesBDropdown = new PopupMenu.PopupSubMenuMenuItem(
      _("Output B")
    );
    this._applet_context_menu.addMenuItem(this.outputDevicesBDropdown);
    this.menu.addMenuItem(this.outputDevicesBDropdown);
    this._control = new Cvc.MixerControl({ name: "Cinnamon Volume Control" });
    this._control.connect(
      "output-added",
      (owner, id) => this.onDeviceOutputAdded(owner, id)
    );
    this._control.connect(
      "output-removed",
      (owner, id) => this.onDeviceOutputRemoved(owner, id)
    );
    this._control.connect(
      "active-output-update",
      (owner, id) => this.onDeviceOutputUpdate(owner, id)
    );
    this._control.open();
  }
  onDeviceOutputUpdate(owner, id) {
  }
  onDeviceOutputAdded(owner, id) {
    let device = this._control.lookup_output_id(id);
    let itemA = this.createPopupItem(device, id, "A");
    this.outputDevicesBDropdown.menu.addMenuItem(itemA);
    let itemB = this.createPopupItem(device, id, "B");
    this.outputDevicesADropdown.menu.addMenuItem(itemB);
    this.devices[id] = {
      description: device.description,
      origin: device.origin,
      item: {
        A: itemA,
        B: itemB
      }
    };
  }
  createPopupItem(device, id, type) {
    let item = new PopupMenu.PopupMenuItem(device.description);
    item.connect("activate", (a, event) => {
      const prevDevice = this.devices[this.selectedDevice[type]];
      if (prevDevice) {
        prevDevice.item[type].setShowDot(false);
      }
      const device2 = this.devices[id];
      this.selectedDevice[type] = id;
      device2.item[type].setShowDot(id === this.selectedDevice[type]);
      this.settings.setValue("outputDescription" + type, device2.description);
      this.settings.setValue("outputOrigin" + type, device2.origin);
      return Clutter.EVENT_STOP;
    });
    let label = new St.Label({
      text: device.origin,
      x_align: Clutter.ActorAlign.END
    });
    item.addActor(label, { expand: true });
    return item;
  }
  onDeviceOutputRemoved(control, id) {
    if (this.devices[id]) {
      this.devices[id].item.A.destroy();
      this.devices[id].item.B.destroy();
    }
    delete this.devices[id];
  }
  on_applet_clicked(event) {
    global.log("click");
    return true;
  }
};
function main(metadata, orientation, panelHeight, instanceId) {
  return new AudioOutputToggler(metadata, orientation, panelHeight, instanceId);
}
