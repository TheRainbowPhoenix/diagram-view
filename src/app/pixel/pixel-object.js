import Rectangle from "../geometry/rectangle";
import C from "../constants";

export default class PixelObject {
  constructor(canvas, id, type) {
    this.canvas = canvas;
    this.id = id;
    this.type = type;
    this.isSelectable = true;
    this.isSelected = false;
    this.isHoverable = true;
    this.isHovered = false;
    this.isPristine = true;
    this.boundingBox = new Rectangle(0, 0, 0, 0);
    this.canvas.pixelPlane.plane.scheduleRender();
    this.canvas.app.state.on(this.id + "-update", this.onUpdate, this);
  }
  render() {
    // TODO
    console.warn("PixelObject::render - TODO");
  }
  destroy() {
    this.canvas.pixelPlane.plane.scheduleRender();
    this.canvas.pixelPlane.plane.off("render", this.render, this);
    this.canvas.app.state.off(this.id + "-update", this.onUpdate, this);
    this.canvas = null;
    this.boundingBox = null;
  }
  delete() {
    this.canvas.app.state.processTransaction({
      action: C.ACTIONS.DELETE,
      id: this.id,
    });
  }
  computeBoundingBox() {
    if (this.isPristine === true) {
      const data = this.canvas.app.state.getStateForId(this.id);
      if (this.type === C.TYPES.ICON) {
        this.computeIconBoundingBox(data);
      }
    }
    return this.boundingBox;
  }
  showHover() {
    this.isHovered = true;
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  hideHover() {
    this.isHovered = false;
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  showSelected() {
    this.isSelected = true;
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  hideSelected() {
    this.isSelected = false;
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  onUpdate() {
    if (this.type === C.TYPES.ICON) {
      this.computeIconBoundingBox();
    }
    this.canvas.pixelPlane.plane.scheduleRender();
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  computeIconBoundingBox(data = null) {
    this.isPristine = false;
    if (data === null) {
      data = this.canvas.app.state.getStateForId(this.id);
    }
    this.boundingBox.set(
      data.position.x,
      data.position.y,
      data.position.x + data.fontSize,
      data.position.y + data.fontSize
    );
  }
}
