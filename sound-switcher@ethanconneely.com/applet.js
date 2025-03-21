"use strict";
var consoleLog = global.log;
var consoleWarn = global.logWarning;
var consoleError = global.logError;
var consoleTrace = global.logTrace;
const St = imports.gi.St;
const Applet = imports.ui.applet;
const Clutter = imports.gi.Clutter;
const Cvc = imports.gi.Cvc;
const popupMenu = imports.ui.popupMenu;
const settings = imports.ui.settings;
consoleLog("\n".repeat(20));
class AudioOutputToggler extends Applet.IconApplet {
  constructor(metadata, orientation, panelHeight, instanceId) {
    super(orientation, panelHeight, instanceId);
    this.selectedDevice = {
      A: -1,
      B: -1
    };
    this.devices = {};
    this.setAllowedLayout(Applet.AllowedLayout.BOTH);
    this.metadata = metadata;
    this.settings = new settings.AppletSettings(
      this,
      metadata.uuid,
      instanceId
    );
    this.settings.bind("outputDeviceA", "outputDeviceA");
    this.settings.bind("outputDeviceB", "outputDeviceB");
    this.set_applet_icon_symbolic_name("audio-speakers");
    this.set_applet_tooltip(_("Toggle Audio Output"));
    this.menuManager = new popupMenu.PopupMenuManager(this);
    this.menu = new Applet.AppletPopupMenu(this, orientation);
    this.menuManager.addMenu(this.menu);
    this.outputDevicesADropdown = new popupMenu.PopupSubMenuMenuItem(
      _("Output A")
    );
    this._applet_context_menu.addMenuItem(this.outputDevicesADropdown);
    this.menu.addMenuItem(this.outputDevicesADropdown);
    this.outputDevicesBDropdown = new popupMenu.PopupSubMenuMenuItem(
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
    this._control.open();
  }
  onDeviceOutputAdded(owner, id) {
    const device = this._control.lookup_output_id(id);
    consoleLog(device.origin, device.description);
    const itemA = this.createPopupItem(device, id, "A");
    this.outputDevicesBDropdown.menu.addMenuItem(itemA);
    const itemB = this.createPopupItem(device, id, "B");
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
    const item = new popupMenu.PopupMenuItem(device.description);
    item.connect("activate", () => {
      const prevDevice = this.devices[this.selectedDevice[type]];
      if (prevDevice) {
        prevDevice.item[type].setShowDot(false);
      }
      const device2 = this.devices[id];
      this.selectedDevice[type] = id;
      device2.item[type].setShowDot(id === this.selectedDevice[type]);
      this.settings.setValue(
        "outputDevice" + type,
        device2.description + " - " + device2.origin
      );
      return Clutter.EVENT_STOP;
    });
    const label = new St.Label({
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
    if (this.devices[id]) {
      delete this.devices[id];
    }
  }
  on_applet_clicked(event) {
    log("click");
    return true;
  }
}
function main(metadata, orientation, panelHeight, instanceId) {
  return new AudioOutputToggler(metadata, orientation, panelHeight, instanceId);
}
