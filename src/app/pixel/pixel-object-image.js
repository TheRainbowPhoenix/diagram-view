import PixelObject from "./pixel-object";
import C from "../constants";
import Rectangle from "../geometry/rectangle";
import * as calc from "../tools/calc";

export default class PixelObjectImage extends PixelObject {
  constructor(canvas, id) {
    super(canvas, id, C.TYPES.IMAGE);
    this.boundingBox = new Rectangle();
    this.hoveredAnchor = null;
    this.selectedAnchor = null;
    this.selectedAnchorIndex = null;
    this.isDragging = false;
    this.isEditable = false;
    this.dragStartPosition = null;
    this.dragStartState = null;
    this.dragTransaction = null;
  }
  computeBoundingBox() {
    const data = this.canvas.app.state.getStateForId(this.id);
    this.boundingBox.set(
      data.position.x,
      data.position.y,
      data.position.x + data.dimensions.width,
      data.position.y + data.dimensions.height
    );
    return this.boundingBox;
  }
  showSelected(isMultiSelection) {
    super.showSelected();
    this.isEditable = !isMultiSelection;
    if (this.isEditable) {
      this.canvas.mouseProjector.on(
        C.EVENTS.RAW_POSITION_CHANGED,
        this.onMouseMove,
        this
      );
      this.canvas.mouseControls.on("mousedown", this.onMouseDown, this, 0);
    }
  }
  hideSelected() {
    super.hideSelected();
    this.isEditable = false;
    this.canvas.mouseProjector.off(
      C.EVENTS.RAW_POSITION_CHANGED,
      this.onMouseMove,
      this
    );
    this.canvas.mouseControls.off("mousedown", this.onMouseDown, this, 0);
  }
  destroy() {
    this.canvas.mouseProjector.off(
      C.EVENTS.RAW_POSITION_CHANGED,
      this.onMouseMove,
      this
    );
    this.canvas.mouseControls.off("mousedown", this.onMouseDown, this, 0);
    this.canvas.mouseProjector.off(
      C.EVENTS.EIGHTS_CELL_CHANGED,
      this.onDrag,
      this
    );
    this.canvas.mouseControls.off("mouseup", this.endDrag, this);
    super.destroy();
  }
  onMouseMove(point) {
    if (this.isDragging) {
      return;
    }
    const anchors = this.boundingBox.getAnchors();
    var closestAnchorIndex = null;
    var closestAnchorDistance = Infinity;
    var distance, i;
    for (i = 0; i < anchors.length; i++) {
      distance = calc.getDistanceBetweenPoints(point, anchors[i]);
      if (distance < closestAnchorDistance) {
        closestAnchorIndex = i;
        closestAnchorDistance = distance;
      }
    }
    if (closestAnchorDistance < 0.4) {
      this.hoveredAnchor = anchors[closestAnchorIndex];
      this.selectedAnchorIndex = closestAnchorIndex;
      document.body.classList.add("hover");
    } else {
      this.hoveredAnchor = null;
    }
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  onMouseDown(event) {
    this.selectedAnchor = this.hoveredAnchor;
    if (!this.selectedAnchor) {
      return;
    }
    this.dragStartPosition =
      this.canvas.mouseProjector.getPlaneCoordinatesForMouseEvent(
        event,
        C.EVENTS.QUARTER_CELL_INTERSECTION_CHANGED
      );
    this.dragStartState = this.canvas.app.state.getStateForId(this.id, true);
    this.isDragging = true;
    this.canvas.interactionPlane.plane.scheduleRender();
    this.canvas.mouseProjector.on(
      C.EVENTS.EIGHTS_CELL_CHANGED,
      this.onDrag,
      this
    );
    this.canvas.mouseControls.on("mouseup", this.endDrag, this);
    return false;
  }
  onDrag(point) {
    var deltaX = point.x - this.dragStartPosition.x;
    var deltaY = point.y - this.dragStartPosition.y;
    var x = this.dragStartState.position.x;
    var y = this.dragStartState.position.y;
    var width = this.dragStartState.dimensions.width;
    var height = this.dragStartState.dimensions.height;
    if (this.selectedAnchorIndex === 0) {
      x += deltaX;
      y += deltaY;
      width -= deltaX;
      height -= deltaY;
    } else if (this.selectedAnchorIndex === 1) {
      y += deltaY;
      width += deltaX;
      height -= deltaY;
    } else if (this.selectedAnchorIndex === 2) {
      width += deltaX;
      height += deltaY;
    } else if (this.selectedAnchorIndex === 3) {
      x += deltaX;
      width -= deltaX;
      height += deltaY;
    }
    if (width < 0.25 || height < 0.25) {
      return;
    }
    this.dragTransaction = {
      id: this.id,
      action: C.ACTIONS.UPDATE,
      isTransient: true,
      data: {
        position: {
          x: x,
          y: y,
        },
        dimensions: {
          width: width,
          height: height,
        },
      },
    };
    this.canvas.app.state.processTransaction(this.dragTransaction);
  }
  endDrag() {
    this.canvas.mouseProjector.off(
      C.EVENTS.EIGHTS_CELL_CHANGED,
      this.onDrag,
      this
    );
    this.canvas.mouseControls.off("mouseup", this.endDrag, this);
    this.selectedAnchor = null;
    this.isDragging = false;
    if (this.dragTransaction) {
      this.dragTransaction.isTransient = false;
      this.canvas.app.state.processTransaction(this.dragTransaction);
    }
  }
}
