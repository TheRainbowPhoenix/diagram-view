import C from "../constants";
import LineFinder from "./line-finder";
import * as tools from "../tools/tools";
import * as lineTools from "./line-tools";
import * as calc from "../tools/calc";
import AreaWallGeometry from "./area-wall-geometry";

export default class Area {
  constructor(canvas, id) {
    this.isLocked = false; // FixMe ?
    this.canvas = canvas;
    this.id = id;
    this.type = C.TYPES.AREA;
    this.isSelected = false;
    this.isSelectable = true;
    this.isHovered = false;
    this.isHoverable = true;
    this.isEditable = false;
    this.hoveredAnchorIndex = null;
    this.lineFinder = new LineFinder(this);
    this.originalAnchorPositions = null;
    this.wallGeometry = null;
    this.updateWallGeometry();
    this.canvas.app.state.on(
      `${this.id}-${C.ACTIONS.UPDATE}`,
      this.updateWallGeometry,
      this
    );
  }
  saveState(data, isTransient) {
    this.canvas.app.state.processTransaction({
      action: C.ACTIONS.UPDATE,
      id: this.id,
      isTransient: isTransient,
      data: data,
    });
  }
  destroy() {
    this.canvas.mouseProjector.off(
      C.EVENTS.EIGHTS_CELL_CHANGED,
      this.onMouseMove,
      this
    );
    this.canvas.mouseControls.off("mousedown", this.onMouseDown, this, 0);
    this.canvas.mouseControls.off("dblclick", this.addAnchorPoint, this, 0);
    this.canvas.mouseControls.off("mouseup", this.onMouseUp, this);
    this.canvas.app.state.off(
      `${this.id}-${C.ACTIONS.UPDATE}`,
      this.updateWallGeometry,
      this
    );
    if (this.wallGeometry) {
      this.wallGeometry.destroy();
      this.wallGeometry = null;
    }
    this.canvas.linePlane.drawAll();
    this.canvas = null;
    this.id = null;
    this.lineFinder.destroy();
  }
  delete() {
    this.canvas.app.state.processTransaction({
      action: C.ACTIONS.DELETE,
      id: this.id,
    });
  }
  updateWallGeometry() {
    const state = this.canvas.app.state.getStateForId(this.id);
    if (state.areaType === C.AREA_TYPES.STANDARD && this.wallGeometry) {
      this.wallGeometry.destroy();
      this.wallGeometry = null;
    }
    if (
      typeof state.areaType !== "undefined" &&
      state.areaType !== C.AREA_TYPES.STANDARD
    ) {
      if (!this.wallGeometry) {
        this.wallGeometry = new AreaWallGeometry(this.canvas, this.id);
      }
    }
    if (this.wallGeometry) {
      this.wallGeometry.setHeight(state.wallHeight);
      this.wallGeometry.setColor(state.wallColor);
    }
  }
  storeCurrentPosition() {
    this.originalAnchorPositions = tools.deepClone(
      this.canvas.app.state.getStateForId(this.id).anchors
    );
  }
  setPositionDelta(deltaX, deltaY, isTransient) {
    const newAnchors = [];
    for (var i = 0; i < this.originalAnchorPositions.length; i++) {
      newAnchors.push({
        x: this.originalAnchorPositions[i].x + deltaX,
        y: this.originalAnchorPositions[i].y + deltaY,
      });
    }
    this.canvas.app.state.processTransaction({
      id: this.id,
      isTransient: isTransient,
      action: C.ACTIONS.UPDATE,
      data: {
        anchors: newAnchors,
      },
    });
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
    this.isHovered = false;
    this.isEditable = !isMultiSelection;
    if (this.isEditable) {
      this.canvas.mouseProjector.on(
        C.EVENTS.EIGHTS_CELL_CHANGED,
        this.onMouseMove,
        this
      );
      this.canvas.mouseControls.on("mousedown", this.onMouseDown, this, 0);
      this.canvas.mouseControls.on("dblclick", this.addAnchorPoint, this, 0);
    }
  }
  hideSelected() {
    this.isSelected = false;
    this.isHoverable = !this.isLocked;
    this.isHovered = false;
    this.isEditable = false;
    this.canvas.mouseProjector.off(
      C.EVENTS.EIGHTS_CELL_CHANGED,
      this.onMouseMove,
      this
    );
    this.canvas.mouseControls.off("mousedown", this.onMouseDown, this, 0);
    this.canvas.mouseControls.off("dblclick", this.addAnchorPoint, this, 0);
  }
  computeBoundingBox() {
    return lineTools.computeBoundingBox(
      this.canvas.app.state.getStateForId(this.id)
    );
  }
  addAnchorPoint(event) {
    const position =
      this.canvas.mouseProjector.getPlaneCoordinatesForMouseEvent(
        event,
        C.EVENTS.HALF_CELL_INTERSECTION_CHANGED
      );
    const lineSegment = this.lineFinder.getClosestLineSegment(position);
    const anchors = this.canvas.app.state.getStateForId(this.id).anchors;
    const index =
      lineSegment.index === anchors.length - 1 ? 0 : lineSegment.index + 1;
    anchors.splice(index, 0, position);
    this.saveState({
      anchors: anchors,
    });
  }
  onMouseDown() {
    this.selectedAnchorIndex = this.hoveredAnchorIndex;
    if (this.hoveredAnchorIndex !== null) {
      this.moveSelectedAnchor = true;
      this.canvas.mouseControls.on("mouseup", this.onMouseUp, this);
      this.canvas.interactionPlane.drawPositionIndicator(
        this.canvas.app.state.getStateForId(this.id).anchors[
          this.selectedAnchorIndex
        ]
      );
      this.canvas.interactionPlane.plane.scheduleRender();
      return false;
    }
  }
  onMouseMove(pos) {
    const anchors = this.canvas.app.state.getStateForId(this.id).anchors;
    if (this.moveSelectedAnchor) {
      this.updateSelectedAnchorPosition(anchors, pos);
      this.canvas.interactionPlane.drawPositionIndicator(
        anchors[this.selectedAnchorIndex]
      );
    } else {
      this.findHoveredAnchors(anchors, pos);
    }
  }
  onMouseUp() {
    this.moveSelectedAnchor = false;
    this.saveState({
      anchors: this.canvas.app.state.getStateForId(this.id).anchors,
    });
    this.canvas.mouseControls.off("mouseup", this.onMouseUp, this);
    this.canvas.interactionPlane.hidePositionIndicator();
  }
  updateSelectedAnchorPosition(anchors, pos) {
    anchors[this.selectedAnchorIndex].x = pos.x;
    anchors[this.selectedAnchorIndex].y = pos.y;
    this.saveState(
      {
        anchors: anchors,
      },
      true
    );
  }
  findHoveredAnchors(anchors, pos) {
    const closestAnchor = calc.getClosestPoint(pos, anchors);
    const oldHoveredAnchorIndex = this.hoveredAnchorIndex;
    if (closestAnchor.distance < 0.5) {
      this.hoveredAnchorIndex = closestAnchor.index;
    } else {
      this.hoveredAnchorIndex = null;
    }
    if (this.hoveredAnchorIndex !== oldHoveredAnchorIndex) {
      this.canvas.interactionPlane.plane.scheduleRender();
    }
  }
}
