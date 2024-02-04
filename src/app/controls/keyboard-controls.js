import EventEmitter from "../tools/event-emitter";
import keyActions from "./key-actions";
import KEYS from "./keys";

const CMD_KEY_CODES = [91, 93, 224];

export default class KeyboardControls extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.pressedKeys = {};
    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));
  }
  isValidSource(e) {
    // console.log(e.target);
    return (
      !["menu", "menuitem"].includes(
        e.target.role
      ) /* document.activeElement.tagName === "BODY" || */ &&
      document.activeElement.id === "root"
    );
  }
  onKeyDown(e) {
    if (!this.isValidSource(e)) {
      this.pressedKeys = {};
      this.updatePressedKeys(e);
      return;
    }

    if (this.isInputEvent(e)) {
      return;
    }

    if (this.pressedKeys[e.keyCode] === true) {
      return;
    }
    this.pressedKeys[e.keyCode] = true;
    this.updatePressedKeys(e);
    if (keyActions[e.keyCode] && keyActions[e.keyCode].down) {
      if (
        this.canvas.app.$refs.viewControls.isDashboardMode &&
        keyActions[e.keyCode].isManipulation
      ) {
        return;
      }
      keyActions[e.keyCode].down(this, this.canvas, e);
    }
  }
  onKeyUp(e) {
    if (!this.isValidSource(e)) {
      this.pressedKeys = {};
      this.updatePressedKeys(e);
      return;
    }

    if (this.isInputEvent(e)) {
      return;
    }
    this.pressedKeys[e.keyCode] = false;
    this.updatePressedKeys(e);
    if (keyActions[e.keyCode] && keyActions[e.keyCode].up) {
      if (
        this.canvas.app.$refs.viewControls.isDashboardMode &&
        keyActions[e.keyCode].isManipulation
      ) {
        return;
      }
      keyActions[e.keyCode].up(this, this.canvas);
    }
  }
  isInputEvent(event) {
    return (
      (event.target.nodeName === "A" ||
        event.target.nodeName === "INPUT" ||
        event.target.nodeName === "TEXTAREA") &&
      event.keyCode !== KEYS.ESC
    );
  }
  updatePressedKeys(event) {
    this.pressedKeys[KEYS.SHIFT] = event.shiftKey;
    this.pressedKeys[KEYS.CTRL] = event.ctrlKey;
    this.pressedKeys[KEYS.ALT] = event.altKey;
    this.pressedKeys[KEYS.CMD] = CMD_KEY_CODES.indexOf(event.keyCode) > -1;
  }
  ctrlKeyPressed() {
    return this.pressedKeys[KEYS.CTRL] || this.pressedKeys[KEYS.CMD];
  }
}
