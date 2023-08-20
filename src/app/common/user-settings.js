import DEFAULTS from "../user/default-settings";
import EventEmitter from "../tools/event-emitter";

export default class UserSettings extends EventEmitter {
  constructor() {
    super();
    this.isReady = false;
    this.settings = null;
  }
  setAll(settings) {
    this.settings = settings;
  }
  get(key) {
    if (typeof this.settings[key] === undefined) {
      return DEFAULTS[key];
    } else {
      return this.settings[key];
    }
  }
  set(key, value) {
    this.settings[key] = value;
    this.emit(key + "changed", value);
  }
}
