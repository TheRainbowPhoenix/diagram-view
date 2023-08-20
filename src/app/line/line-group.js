import C from "../constants";
import * as tools from "../tools/tools";
import * as lineTools from "./line-tools";
import LineFinder from "./line-finder";
import LineSubparts from "./line-subparts";

export default class LineGroup {
  constructor(id, canvas) {
    this.isLocked = false; // TODO: quick fix to test
    this.id = id;
    this.canvas = canvas;
    this.isLineGroup = true;
    this.isSelected = false;
    this.isSelectable = true;
    this.isHovered = false;
    this.isHoverable = true;
    this.isDestroyed = false;
    this.isEditable = false;
    this.subparts = new LineSubparts(this);
    this.lineFinder = new LineFinder(this);
    this.anchorPointWasMoved = false;
    this.type = C.TYPES.LINE_GROUP;
    this.currentState = null;
  }
  saveState(data, isTransient) {
    this.canvas.app.state.processTransaction({
      action: C.ACTIONS.UPDATE,
      id: this.id,
      isTransient: isTransient,
      data: data,
    });
  }
  delete() {
    if (this.isDestroyed) {
      return;
    }
    this.canvas.app.state.processTransaction({
      action: C.ACTIONS.DELETE,
      id: this.id,
    });
  }
  destroy() {
    this.canvas.mouseControls.off("mouseup", this.onMouseUp, this);
    this.canvas.mouseControls.off("mousedown", this.onMouseDown, this);
    this.canvas.mouseControls.off("dblclick", this.onDblClick, this);
    this.canvas.mouseProjector.off(
      C.EVENTS.HALF_CELL_INTERSECTION_CHANGED,
      this.onMouseMove,
      this
    );
    this.subparts.destroy();
    this.lineFinder.destroy();
    this.id = null;
    this.canvas = null;
    this.isDestroyed = true;
  }
  onHover(event, planeIntersectionPoint) {
    if (this.isSelected === false) {
      return;
    }
    this.subparts.reset();
    this.lineFinder.setClosestSubPartHovered(planeIntersectionPoint);
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  storeCurrentPosition() {
    this.currentState = this.canvas.app.state.getStateForId(this.id, true);
  }
  setPositionDelta(deltaX, deltaY, isTransient) {
    const newState = tools.deepClone(this.currentState);
    var i, anchor;
    for (i = 0; i < newState.anchors.length; i++) {
      anchor = newState.anchors[i];
      if (anchor && anchor.type === C.ANCHOR_TYPES.STANDALONE) {
        anchor.x += deltaX;
        anchor.y += deltaY;
      }
    }
    this.saveState(newState, isTransient);
  }
  connectToAnchorPoint(_anchorPoint) {
    const data = this.canvas.app.state.getStateForId(this.id, true);
    const anchorPoint = lineTools.toAnchorPoint(_anchorPoint);
    var anchorPointIndex = null,
      i,
      currentAnchor;
    for (i = 0; i < data.anchors.length; i++) {
      if (data.anchors[i] === null) {
        continue;
      }
      currentAnchor = lineTools.toAnchorPoint(data.anchors[i]);
      if (
        currentAnchor.x === anchorPoint.x &&
        currentAnchor.y === anchorPoint.y
      ) {
        anchorPointIndex = i;
        break;
      }
    }
    if (anchorPointIndex === null) {
      this.addAnchorPointAndLineSegment(anchorPoint);
    } else if (typeof this.subparts.selectedSubPartIndex === "number") {
      data.lines.push([this.subparts.selectedSubPartIndex, anchorPointIndex]);
      this.subparts.setSelected(
        anchorPointIndex,
        C.SUB_PART_TYPES.ANCHOR_POINT
      );
      this.saveState(data);
    }
  }
  addAnchorPointAndLineSegment(anchorPoint) {
    const data = this.canvas.app.state.getStateForId(this.id, true);
    data.anchors.push(anchorPoint);
    const newAnchorIndex = data.anchors.length - 1;
    if (
      this.subparts.selectedSubPartType === C.SUB_PART_TYPES.ANCHOR_POINT &&
      typeof this.subparts.selectedSubPartIndex === "number"
    ) {
      data.lines.push([this.subparts.selectedSubPartIndex, newAnchorIndex]);
    }
    this.subparts.setSelected(newAnchorIndex, C.SUB_PART_TYPES.ANCHOR_POINT);
    this.saveState(data);
  }
  getSelectedAnchor() {
    if (this.subparts.selectedSubPartType === C.SUB_PART_TYPES.ANCHOR_POINT) {
      return this.canvas.app.state.getStateForId(this.id).anchors[
        this.subparts.selectedSubPartIndex
      ];
    } else {
      return null;
    }
  }
  showHover() {
    this.isHovered = true;
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  hideHover() {
    this.isHovered = false;
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  showSelected(isMultiSelection) {
    this.isSelected = true;
    this.isHoverable = false;
    this.isEditable = !isMultiSelection;
    if (this.isEditable) {
      this.canvas.mouseControls.on("mouseup", this.onMouseUp, this, 0);
      this.canvas.mouseControls.on("mousedown", this.onMouseDown, this, 0);
      this.canvas.mouseControls.on("dblclick", this.onDblClick, this);
    }
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  hideSelected() {
    if (
      this.isSelected &&
      this.canvas.app.interactionMode.getActiveMode() === "draw-lines"
    ) {
      return false;
    }
    this.isEditable = false;
    this.isSelected = false;
    this.isHoverable = !this.isLocked;
    this.isHovered = false;
    this.subparts.reset(true);
    this.canvas.mouseControls.off("mouseup", this.onMouseUp, this);
    this.canvas.mouseControls.off("mousedown", this.onMouseDown, this);
    this.canvas.mouseControls.off("dblclick", this.onDblClick, this);
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  onDblClick(event) {
    if (this.subparts.hoveredSubPartType !== C.SUB_PART_TYPES.LINE_SEGMENT) {
      return;
    }
    const line = this.subparts.getHoveredSubPart();
    const point = this.canvas.mouseProjector.getPlaneCoordinatesForMouseEvent(
      event,
      C.EVENTS.HALF_CELL_INTERSECTION_CHANGED
    );
    this.subparts.splitLineAtPoint(line, point);
  }
  onMouseUp() {
    this.canvas.interactionPlane.hidePositionIndicator();
    if (this.canvas.app.interactionMode.getActiveMode() === "draw-lines") {
      return;
    }
    this.canvas.mouseProjector.off(
      C.EVENTS.HALF_CELL_INTERSECTION_CHANGED,
      this.onMouseMove,
      this
    );
    if (this.anchorPointWasMoved === true) {
      const data = this.canvas.app.state.getStateForId(this.id, true);
      this.saveState(data);
      return;
    }
    if (this.subparts.selectedSubPartType === C.SUB_PART_TYPES.ANCHOR_POINT) {
      this.canvas.app.interactionMode.set("draw-lines", this);
    }
  }
  onMouseDown() {
    if (this.canvas.app.interactionMode.getActiveMode() === "draw-lines") {
      return;
    }
    this.anchorPointWasMoved = false;
    this.canvas.mouseProjector.on(
      C.EVENTS.HALF_CELL_INTERSECTION_CHANGED,
      this.onMouseMove,
      this
    );
    if (this.subparts.hoveredSubPartType !== null) {
      this.subparts.selectHoveredSubPart();
      this.canvas.interactionPlane.drawPositionIndicator(
        this.canvas.app.state.getStateForId(this.id).anchors[
          this.subparts.selectedSubPartIndex
        ]
      );
      this.canvas.interactionPlane.plane.scheduleRender();
      return false;
    }
  }
  onMouseMove(point, event) {
    if (this.subparts.selectedSubPartType !== C.SUB_PART_TYPES.ANCHOR_POINT) {
      return;
    }
    const data = this.canvas.app.state.getStateForId(this.id, true);
    this.anchorPointWasMoved = true;
    data.anchors[this.subparts.selectedSubPartIndex].x = point.x;
    data.anchors[this.subparts.selectedSubPartIndex].y = point.y;
    this.canvas.interactionPlane.drawPositionIndicator(point);
    this.saveState(data, true);
  }
  computeBoundingBox() {
    return lineTools.computeBoundingBox(
      this.canvas.app.state.getStateForId(this.id)
    );
  }
}
