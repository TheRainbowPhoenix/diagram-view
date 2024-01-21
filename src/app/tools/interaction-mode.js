import CONSTANTS from "../constants";
import C from "../constants";
import MODES from "../state/modes";
import EventEmitter from "./event-emitter";

const TRACKABLE_MODES = {
  [C.INTERACTION_MODE.PLACE_COMPONENT]: true,
  [C.INTERACTION_MODE.DRAW_LINES]: true,
  [C.INTERACTION_MODE.DRAW_AREA]: true,
  [C.INTERACTION_MODE.ADD_LABEL]: true,
  [C.INTERACTION_MODE.ADD_ICON]: true,
  [C.INTERACTION_MODE.ADD_IMAGE]: true,
  [C.INTERACTION_MODE.ADD_GENERIC]: true,
};

export default class InteractionMode extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.canvas.app.eventHub.on("user-cancel", this.endActiveMode, this, 3);
    this.previousMode = null;
    this.previousModeData = null;
    this.activeMode = null;
    this.activeModeData = null;
    this.isStaticMode = false;
  }
  setStaticMode(mode, data) {
    this.set(mode, data);
    this.isStaticMode = true;
  }
  getActiveMode() {
    if (this.activeMode === null) {
      return CONSTANTS.INTERACTION_MODE.PAN_ON_DRAG; // SELECT
    } else {
      return this.activeMode.name;
    }
  }
  set(mode, data) {
    if (this.isStaticMode === true) {
      return;
    }
    if (!MODES[mode]) {
      throw new Error("Unknown mode " + mode);
    }
    if (this.activeMode) {
      this.activeMode.stop(this.canvas);
      if (MODES[mode].returnToPreviousMode) {
        this.previousMode = this.activeMode;
        this.previousModeData = this.activeModeData;
      } else {
        this.previousMode = null;
        this.previousModeData = null;
      }
    }
    if (TRACKABLE_MODES[mode]) {
      this.canvas.app.trackEvent("mode", "change", mode);
    }
    this.activeMode = MODES[mode];
    this.activeModeData = data;
    this.activeMode.start(this.canvas, data);
    this.emit("change", mode, data);
  }
  endActiveMode() {
    if (!this.activeMode || this.isStaticMode) {
      return;
    }
    this.activeMode.stop(this.canvas);
    const isSameMode =
      this.activeMode &&
      this.previousMode &&
      this.activeMode.name === this.previousMode.name;
    if (
      this.previousMode &&
      this.activeMode.returnToPreviousMode &&
      !isSameMode
    ) {
      this.activeMode = null;
      this.set(this.previousMode.name, this.previousModeData);
    } else {
      this.previousMode = null;
      this.previousModeData = null;
      this.activeMode = null;
      this.activeModeData = null;
      this.emit("change", "select");
    }
  }
}
