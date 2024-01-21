import C from "../constants";
import KEYS from "./keys";
import config from "../config";
import styles from "../common/styles";
import Rectangle from "../geometry/rectangle";

export default class SelectionRectangle {
  constructor(canvas, applyCallback) {
    this.canvas = canvas;
    this.applyCallback = applyCallback;
    this.canvas.mouseControls.on("mousedown", this.start, this, 4);
    this.canvas.interactionPlane.plane.on("render", this.render, this, 4);
    this.activeRectangle = null;
    this.startPos = null;
    this.currentPos = null;
  }
  render() {
    if (this.activeRectangle === null) {
      return;
    }
    this.canvas.interactionPlane.plane.setFillStyle(
      styles.selectionRectangle.background
    );
    this.canvas.interactionPlane.plane.setStrokeStyle(
      styles.selectionRectangle.border
    );
    this.canvas.interactionPlane.plane.setLineWidth(
      styles.selectionRectangle.borderWidth
    );
    this.canvas.interactionPlane.plane.setLineDash(
      styles.selectionRectangle.lineDash
    );
    this.canvas.interactionPlane.plane.fillRect(this.activeRectangle);
    this.canvas.interactionPlane.plane.strokeRect(this.activeRectangle);
    this.canvas.interactionPlane.plane.setLineDash([]);
  }
  start(event) {
    if (this.canvas.app.interactionMode.getActiveMode() !== "select") {
      return;
    }
    if (this.canvas.app.$refs.viewControls.isDashboardMode) {
      return;
    }
    this.startPos = this.canvas.mouseProjector.getPlaneCoordinatesForMouseEvent(
      event,
      C.EVENTS.RAW_POSITION_CHANGED
    );
    this.canvas.mouseProjector.on(
      C.EVENTS.RAW_POSITION_CHANGED,
      this.update,
      this
    );
    this.canvas.mouseControls.on("mouseup", this.apply, this, 0);
  }
  update(point) {
    this.currentPos = point;
    this.activeRectangle = Rectangle.fromPoints(this.currentPos, this.startPos);
    this.canvas.interactionPlane.plane.scheduleRender();
    const hoveredObjects =
      this.canvas.app.objectFinder.getObjectsWithinRectangle(
        this.activeRectangle
      );
    const objects = this.canvas.app.objects.getAll();
    var obj, id;
    for (id in objects) {
      obj = objects[id];
      if (obj && obj.isHoverable && !obj.isSelected) {
        if (hoveredObjects.indexOf(obj) === -1) {
          obj.hideHover();
        } else {
          obj.showHover();
        }
      }
    }
  }
  apply(event) {
    this.canvas.mouseControls.off("mouseup", this.apply, this);
    this.canvas.mouseProjector.off(
      C.EVENTS.RAW_POSITION_CHANGED,
      this.update,
      this
    );
    this.canvas.interactionPlane.plane.scheduleRender();
    if (!this.currentPos) {
      return;
    }
    const rectangle = Rectangle.fromPoints(this.currentPos, this.startPos);
    this.startPos = null;
    this.currentPos = null;
    this.activeRectangle = null;
    if (
      rectangle.width > config.minSelectionSize ||
      rectangle.height > config.minSelectionSize
    ) {
      this.applyCallback(rectangle);
      return false;
    }
  }
}
