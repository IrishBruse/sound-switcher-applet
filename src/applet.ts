// https://github.com/IrishBruse/sound-switcher-applet

const Applet = imports.ui.applet;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Gio = imports.gi.Gio;
const Interfaces = imports.misc.interfaces;
const Util = imports.misc.util;
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

type Device = {
  description: string;
  origin: string;
  item: {
    A: imports.ui.popupMenu.PopupMenuItem;
    B: imports.ui.popupMenu.PopupMenuItem;
  };
};

console.log("test");

class AudioOutputToggler extends Applet.IconApplet {
  selectedDevice = {
    A: -1,
    B: -1,
  };
  metadata: { uuid: string };
  settings: imports.ui.settings.AppletSettings;
  menuManager: imports.ui.popupMenu.PopupMenuManager;
  menu: imports.ui.applet.AppletPopupMenu;
  outputDevicesADropdown: imports.ui.popupMenu.PopupSubMenuMenuItem;
  outputDevicesBDropdown: imports.ui.popupMenu.PopupSubMenuMenuItem;
  _control: imports.gi.Cvc.MixerControl;
  devices: Record<string, Device> = {};

  constructor(
    metadata: { uuid: string },
    orientation: imports.gi.St.Side,
    panelHeight: number,
    instanceId: number
  ) {
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
    this._control.connect("output-added", (owner, id) =>
      this.onDeviceOutputAdded(owner, id)
    );
    this._control.connect("output-removed", (owner, id) =>
      this.onDeviceOutputRemoved(owner, id)
    );
    this._control.connect("active-output-update", (owner, id) =>
      this.onDeviceOutputUpdate(owner, id)
    );

    this._control.open();
  }
  onDeviceOutputUpdate(owner: imports.gi.Cvc.MixerControl, id: number) {}

  onDeviceOutputAdded(owner: imports.gi.Cvc.MixerControl, id: number) {
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
        B: itemB,
      },
    };
  }

  createPopupItem(
    device: imports.gi.Cvc.MixerUIDevice,
    id: number,
    type: "A" | "B"
  ) {
    let item = new PopupMenu.PopupMenuItem(device.description);

    item.connect("activate", (a, event) => {
      const prevDevice = this.devices[this.selectedDevice[type]];
      if (prevDevice) {
        prevDevice.item[type].setShowDot(false);
      }

      const device = this.devices[id];
      this.selectedDevice[type] = id;
      device.item[type].setShowDot(id === this.selectedDevice[type]);

      this.settings.setValue("outputDescription" + type, device.description);
      this.settings.setValue("outputOrigin" + type, device.origin);

      return Clutter.EVENT_STOP;
    });

    let label = new St.Label({
      text: device.origin,
      x_align: Clutter.ActorAlign.END,
    });
    item.addActor(label, { expand: true });

    return item;
  }

  onDeviceOutputRemoved(control: any, id: number) {
    if (this.devices[id]) {
      this.devices[id].item.A.destroy();
      this.devices[id].item.B.destroy();
    }
    delete this.devices[id];
  }

  on_applet_clicked(event: any) {
    global.log("click");

    return true;
  }
}

function main(
  metadata: any,
  orientation: any,
  panelHeight: any,
  instanceId: any
) {
  return new AudioOutputToggler(metadata, orientation, panelHeight, instanceId);
}
