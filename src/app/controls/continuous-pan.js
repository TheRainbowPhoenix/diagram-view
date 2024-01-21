import config from "../config";
import KEYS from "./keys";

export default class ContinuousPan {
  constructor(canvas) {
    this.canvas = canvas;
    this.animationFrame = null;
    this.panByOffsetFn = this.panByOffset.bind(this);
    this.offsetX = 0;
    this.offsetY = 0;
  }
  reset() {
    this.offsetX = 0;
    this.offsetY = 0;
    const dir = this.canvas.camera.getDirection();
    var a, b, c, d;
    if (dir === 0) {
      a = KEYS.ARROW_LEFT;
      b = KEYS.ARROW_UP;
      c = KEYS.ARROW_RIGHT;
      d = KEYS.ARROW_DOWN;
    } else if (dir === 1) {
      a = KEYS.ARROW_DOWN;
      b = KEYS.ARROW_LEFT;
      c = KEYS.ARROW_UP;
      d = KEYS.ARROW_RIGHT;
    } else if (dir === 2) {
      a = KEYS.ARROW_RIGHT;
      b = KEYS.ARROW_DOWN;
      c = KEYS.ARROW_LEFT;
      d = KEYS.ARROW_UP;
    } else if (dir === 3) {
      a = KEYS.ARROW_UP;
      b = KEYS.ARROW_RIGHT;
      c = KEYS.ARROW_DOWN;
      d = KEYS.ARROW_LEFT;
    }
    if (this.canvas.camera.isTopDown) {
      if (this.canvas.keyboardControls.pressedKeys[a]) {
        this.offsetY += config.continuousPanPerFrame;
      }
      if (this.canvas.keyboardControls.pressedKeys[b]) {
        this.offsetX += config.continuousPanPerFrame * -1;
      }
      if (this.canvas.keyboardControls.pressedKeys[c]) {
        this.offsetY += config.continuousPanPerFrame * -1;
      }
      if (this.canvas.keyboardControls.pressedKeys[d]) {
        this.offsetX += config.continuousPanPerFrame;
      }
    } else {
      if (this.canvas.keyboardControls.pressedKeys[a]) {
        this.offsetY += config.continuousPanPerFrame;
        this.offsetX += config.continuousPanPerFrame * -1;
      }
      if (this.canvas.keyboardControls.pressedKeys[b]) {
        this.offsetY += config.continuousPanPerFrame * -1;
        this.offsetX += config.continuousPanPerFrame * -1;
      }
      if (this.canvas.keyboardControls.pressedKeys[c]) {
        this.offsetY += config.continuousPanPerFrame * -1;
        this.offsetX += config.continuousPanPerFrame;
      }
      if (this.canvas.keyboardControls.pressedKeys[d]) {
        this.offsetY += config.continuousPanPerFrame;
        this.offsetX += config.continuousPanPerFrame;
      }
    }
    if (this.offsetX === 0 && this.offsetY === 0) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
      return;
    }
    const viewPortRectangle = this.canvas.mouseProjector.getViewPortRectangle();
    const f = Math.min(viewPortRectangle.width, viewPortRectangle.height);
    this.offsetX *= f;
    this.offsetY *= f;
    if (this.animationFrame === null) {
      this.panByOffset();
    }
  }
  panByOffset() {
    this.animationFrame = window.requestAnimationFrame(this.panByOffsetFn);
    this.canvas.camera.setPosition(
      this.canvas.camera.camera.position.x + this.offsetX,
      0,
      this.canvas.camera.camera.position.z + this.offsetY
    );
  }
  stopContinuousPan() {
    window.cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }
}
