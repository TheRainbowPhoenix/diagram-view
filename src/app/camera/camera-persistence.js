import DEFAULTS from "../user/default-settings";

const defaultUserSettings = DEFAULTS;

const r = (val) => {
  return Math.round(val * 1e4) / 1e4;
};

export default class CameraPersistence {
  constructor(canvas) {
    this.canvas = canvas;
    this.loadAttempts = 0;
  }
  reset() {
    this.canvas.app.userSettings.set(
      "cameraPosition",
      defaultUserSettings.cameraPosition
    );
    this.canvas.app.userSettings.set(
      "cameraRotation",
      defaultUserSettings.cameraRotation
    );
    this.canvas.app.userSettings.set("zoom", defaultUserSettings.zoom);
    this.canvas.app.userSettings.set("cameraIsTopDown", false);
    this.canvas.app.userSettings.set("cameraEuler", null);
    if (this.loadAttempts < 4) {
      this.load();
    }
  }
  load() {
    this.loadAttempts++;
    if (!this.canvas.app.userSettings.get("cameraEuler")) {
      this.reset();
    }
    try {
      this.canvas.camera.isTopDown =
        this.canvas.app.userSettings.get("cameraIsTopDown");
      this.canvas.camera.angle =
        this.canvas.app.userSettings.get("cameraRotation");
      this.canvas.camera.camera.position.fromArray(
        this.getArray("cameraPosition")
      );
      this.canvas.camera.camera.zoom = this.canvas.app.userSettings.get("zoom");
      this.canvas.camera.camera.updateProjectionMatrix();
      const cameraEuler = this.canvas.app.userSettings.get("cameraEuler");
      if (cameraEuler) {
        this.canvas.camera.camera.rotation.fromArray(cameraEuler);
      } else {
        this.canvas.camera.camera.lookAt(
          this.canvas.camera.projectCircle().center
        );
      }
      requestAnimationFrame(() => {
        this.canvas.camera.emit("change");
      });
    } catch (e) {
      console.warn("Error while loading camera settings", e);
      this.reset();
    }
  }
  save() {
    this.canvas.app.userSettings.set(
      "cameraIsTopDown",
      this.canvas.camera.isTopDown
    );
    this.canvas.app.userSettings.set(
      "cameraRotation",
      this.canvas.camera.angle
    );
    this.canvas.app.userSettings.set("zoom", this.canvas.camera.camera.zoom);
    this.canvas.app.userSettings.set(
      "cameraEuler",
      this.canvas.camera.camera.rotation.toArray()
    );
    this.canvas.app.userSettings.set(
      "cameraPosition",
      this.canvas.camera.camera.position.toArray()
    );
  }
  toHash() {
    const euler = this.canvas.camera.camera.rotation.toArray();
    const pos = this.canvas.camera.camera.position.toArray();
    return [
      this.canvas.camera.isTopDown ? 1 : 0,
      r(this.canvas.camera.angle),
      r(this.canvas.camera.camera.zoom),
      r(euler[0]),
      r(euler[1]),
      r(euler[2]),
      r(pos[0]),
      r(pos[1]),
      r(pos[2]),
    ].join("_");
  }
  fromHash(hash) {
    if (!hash) {
      return null;
    }
    const p = hash.split("_").map(parseFloat);
    if (p.length !== 9) {
      return null;
    }
    return {
      cameraIsTopDown: p[0] == 1,
      cameraRotation: p[1],
      zoom: p[2],
      cameraEuler: [p[3], p[4], p[5], "XYZ"],
      cameraPosition: [p[6], p[7], p[8]],
    };
  }
  getArray(key) {
    const value = this.canvas.app.userSettings.get(key);
    if (value instanceof Array) {
      return value;
    } else {
      return [value.x, value.y, value.z];
    }
  }
}
