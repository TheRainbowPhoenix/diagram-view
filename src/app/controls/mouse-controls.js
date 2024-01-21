import config from "../config";
import EventEmitter from "../tools/event-emitter";
import C from "../constants";

export default class MouseControls extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.cam = this.canvas.camera.getThreeObject();
    this.originalZoom = null;
    this.canvas.element.addEventListener("wheel", this.onMouseWheel.bind(this));
    this.canvas.element.addEventListener(
      "mousedown",
      this.onMouseDown.bind(this)
    );
    this.canvas.element.addEventListener(
      "touchstart",
      this.onTouchStart.bind(this)
    );
    this.canvas.element.addEventListener(
      "touchend",
      this.onTouchEnd.bind(this)
    );
    this.canvas.element.addEventListener(
      "touchmove",
      this.onTouchMove.bind(this)
    );
    this.canvas.element.addEventListener("click", this.onClick.bind(this));
    this.canvas.element.addEventListener(
      "dblclick",
      this.onDblClick.bind(this)
    );
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
    document.addEventListener(
      "contextmenu",
      this.onContextMenu.bind(this),
      false
    );
    // TODO: kill Hammer
    // if (config.isEmbed) {
    //   const hm = new Hammer(document.body);
    //   hm.get("pinch").set({
    //     enable: true,
    //   });
    //   hm.on("pinchstart", this.onPinchStart.bind(this));
    //   hm.on("pinch", this.onPinch.bind(this));
    // }
  }
  onClick(e) {
    this.canvas.keyboardControls.updatePressedKeys(e);
    this.emit("click", e);
  }
  onContextMenu(e) {
    this.canvas.keyboardControls.updatePressedKeys(e);
    e.preventDefault();
    this.canvas.app.eventHub.emit("user-cancel");
  }
  onTouchStart(e) {
    if (e.targetTouches.length === 1) {
      this.canvas.mouseProjector.lastEvent = e.targetTouches[0];
      this.emit("mousedown", e.targetTouches[0]);
    }
  }
  onTouchEnd(e) {
    if (e.targetTouches.length === 1) {
      this.emit("mouseup", e.targetTouches[0]);
    }
  }
  onTouchMove(e) {
    if (e.targetTouches.length === 1) {
      this.emit("mousemove", e.targetTouches[0]);
    }
  }
  onPinchStart() {
    this.originalZoom = this.canvas.camera.camera.zoom;
  }
  onPinch(e) {
    this.canvas.camera.setZoom(this.originalZoom * e.scale);
  }
  onMouseWheel(e) {
    e.preventDefault();
    var zoomOffset = config.zoomPerWheelDelta;
    if (e.deltaY > 0) {
      zoomOffset *= -1;
    }
    this.canvas.camera.changeZoomBy(zoomOffset);
  }
  onMouseDown(e) {
    this.canvas.keyboardControls.updatePressedKeys(e);
    if (e.button === 0) {
      this.emit("mousedown", e);
    } else if (e.button === 1) {
      this.canvas.app.interactionMode.set(C.INTERACTION_MODE.PAN);
    }
  }
  onMouseMove(e) {
    this.canvas.keyboardControls.updatePressedKeys(e);
    this.emit("mousemove", e);
  }
  onMouseUp(e) {
    this.canvas.keyboardControls.updatePressedKeys(e);
    if (e.button === 0) {
      this.emit("mouseup", e);
    } else if (e.button === 1) {
      this.canvas.app.interactionMode.endActiveMode();
    }
  }
  onDblClick(e) {
    this.canvas.keyboardControls.updatePressedKeys(e);
    this.emit("dblclick", e);
  }
}
