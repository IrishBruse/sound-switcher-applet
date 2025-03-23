import St from "gi.St";
import applet from "ui.applet";
import Clutter from "gi.Clutter";
import Main from "ui.main";

import Cvc from "gi.Cvc";
import popupMenu from "ui.popupMenu";
import settings from "ui.settings";
import type { Metadata } from "../lib/metadata";
import lang from "lang";

interface Device {
  native: Cvc.MixerUIDevice;
  item: {
    A: popupMenu.PopupMenuItem;
    B: popupMenu.PopupMenuItem;
  };
}

class AudioOutputToggler extends applet.IconApplet {
  selectedDevice = {
    A: -1,
    B: -1,
  };

  isDeviceA = true;

  metadata: Metadata;
  settings: settings.AppletSettings;
  menuManager: popupMenu.PopupMenuManager;
  menu: applet.AppletPopupMenu;
  outputDevicesADropdown: popupMenu.PopupSubMenuMenuItem;
  outputDevicesBDropdown: popupMenu.PopupSubMenuMenuItem;
  _control: Cvc.MixerControl;
  devices: Record<string, Device> = {};

  outputDeviceA = "";
  outputDeviceB = "";
  toggleKey = "";
  outputDeviceAIcon = "";
  outputDeviceBIcon = "";

  constructor(
    metadata: Metadata,
    orientation: St.Side,
    panelHeight: number,
    instanceId: number
  ) {
    super(orientation, panelHeight, instanceId);

    this.setAllowedLayout(applet.AllowedLayout.BOTH);

    this.metadata = metadata;
    this.settings = new settings.AppletSettings(
      this,
      metadata.uuid,
      instanceId
    );

    this.settings.bind("toggleKey", "toggleKey", () => this._setKeybinding());
    this._setKeybinding();

    this.settings.bind("outputDeviceA", "outputDeviceA");
    this.settings.bind("outputDeviceB", "outputDeviceB");

    this.settings.bind("outputDeviceAIcon", "outputDeviceAIcon");
    this.settings.bind("outputDeviceBIcon", "outputDeviceBIcon");

    this.set_applet_icon_name(this.outputDeviceBIcon);

    this.set_applet_tooltip(_("Toggle Audio Output"));

    this.menuManager = new popupMenu.PopupMenuManager(this);
    this.menu = new applet.AppletPopupMenu(this, orientation);
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

  _setKeybinding() {
    Main.keybindingManager.addHotKey(
      "sound-switch-" + this.instance_id,
      this.toggleKey,
      lang.bind(this, () => this.toggleAudioDevice())
    );
  }

  onDeviceOutputAdded(owner: Cvc.MixerControl, id: number) {
    const device = this._control.lookup_output_id(id);

    const itemA = this.createPopupItem(device, id, "A");
    this.outputDevicesADropdown.menu.addMenuItem(itemA);
    const itemB = this.createPopupItem(device, id, "B");
    this.outputDevicesBDropdown.menu.addMenuItem(itemB);

    const deviceIdentifier = device.origin + " - " + device.description;

    if (deviceIdentifier === this.outputDeviceA) {
      itemA.setShowDot(true);
      this.selectedDevice.A = id;
    }

    if (deviceIdentifier === this.outputDeviceB) {
      itemB.setShowDot(true);
      this.selectedDevice.B = id;
    }

    this.devices[id] = {
      native: device,
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
      const native = device.native;
      this.selectedDevice[type] = id;
      device.item[type].setShowDot(id === this.selectedDevice[type]);

      this.settings.setValue(
        "outputDevice" + type,
        native.origin + " - " + native.description
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

  on_applet_clicked() {
    this.toggleAudioDevice();
    return true;
  }

  toggleAudioDevice() {
    console.log("Toggle " + (this.isDeviceA ? "A" : "B"));

    if (this.isDeviceA) {
      const newDevice = this.devices[this.selectedDevice.A];
      this._control.change_output(newDevice.native);
      this.set_applet_icon_name(this.outputDeviceAIcon);
    } else {
      const newDevice = this.devices[this.selectedDevice.B];
      this._control.change_output(newDevice.native);
      this.set_applet_icon_name(this.outputDeviceBIcon);
    }

    this.isDeviceA = !this.isDeviceA;
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
