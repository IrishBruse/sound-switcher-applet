// https://github.com/IrishBruse/sound-switcher-applet

import St from "gi.St";
import Applet from "ui.applet";
import Clutter from "gi.Clutter";

import Cvc from "gi.Cvc";
import popupMenu from "ui.popupMenu";
import settings from "ui.settings";
import type applet from "ui.applet";
import type { Metadata } from "../lib/metadata";

interface Device {
  description: string;
  origin: string;
  item: {
    A: popupMenu.PopupMenuItem;
    B: popupMenu.PopupMenuItem;
  };
}

console.log("\n".repeat(20));

class AudioOutputToggler extends Applet.IconApplet {
  selectedDevice = {
    A: -1,
    B: -1,
  };
  metadata: Metadata;
  settings: settings.AppletSettings;
  menuManager: popupMenu.PopupMenuManager;
  menu: applet.AppletPopupMenu;
  outputDevicesADropdown: popupMenu.PopupSubMenuMenuItem;
  outputDevicesBDropdown: popupMenu.PopupSubMenuMenuItem;
  _control: Cvc.MixerControl;
  devices: Record<string, Device> = {};

  constructor(
    metadata: Metadata,
    orientation: St.Side,
    panelHeight: number,
    instanceId: number
  ) {
    super(orientation, panelHeight, instanceId);

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
    this._control.connect("output-added", (owner, id) =>
      this.onDeviceOutputAdded(owner, id)
    );
    this._control.connect("output-removed", (owner, id) =>
      this.onDeviceOutputRemoved(owner, id)
    );

    this._control.open();
  }

  onDeviceOutputAdded(owner: Cvc.MixerControl, id: number) {
    const device = this._control.lookup_output_id(id);

    console.log(device.origin, device.description);

    const itemA = this.createPopupItem(device, id, "A");
    this.outputDevicesBDropdown.menu.addMenuItem(itemA);
    const itemB = this.createPopupItem(device, id, "B");
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

  createPopupItem(device: Cvc.MixerUIDevice, id: number, type: "A" | "B") {
    const item = new popupMenu.PopupMenuItem(device.description);

    item.connect("activate", () => {
      const prevDevice = this.devices[this.selectedDevice[type]];
      if (prevDevice) {
        prevDevice.item[type].setShowDot(false);
      }

      const device = this.devices[id];
      this.selectedDevice[type] = id;
      device.item[type].setShowDot(id === this.selectedDevice[type]);

      this.settings.setValue(
        "outputDevice" + type,
        device.description + " - " + device.origin
      );

      return Clutter.EVENT_STOP;
    });

    const label = new St.Label({
      text: device.origin,
      x_align: Clutter.ActorAlign.END,
    });
    item.addActor(label, { expand: true });

    return item;
  }

  onDeviceOutputRemoved(control: Cvc.MixerControl, id: number) {
    if (this.devices[id]) {
      this.devices[id].item.A.destroy();
      this.devices[id].item.B.destroy();
    }
    if (this.devices[id]) {
      delete this.devices[id];
    }
  }

  on_applet_clicked(event: Clutter.Event) {
    log("click");

    return true;
  }
}

function main(
  metadata: Metadata,
  orientation: St.Side,
  panelHeight: number,
  instanceId: number
) {
  return new AudioOutputToggler(metadata, orientation, panelHeight, instanceId);
}

export default main;
