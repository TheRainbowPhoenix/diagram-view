import EventEmitter from "../tools/event-emitter";

import C from "../constants";

export default class LineSubparts extends EventEmitter {
  constructor(lineGroup) {
    super();
    this.lineGroup = lineGroup;
    this.hoveredSubPartIndex = null;
    this.hoveredSubPartType = null;
    this.selectedSubPartIndex = null;
    this.selectedSubPartType = null;
    this.lineGroup.canvas.keyboardControls.on(
      "delete",
      this.deleteSelectedSubPart,
      this,
      0
    );
  }
  destroy() {
    this.lineGroup.canvas.keyboardControls.off(
      "delete",
      this.deleteSelectedSubPart,
      this
    );
    this.lineGroup = null;
  }
  setHovered(index, type) {
    this.hoveredSubPartIndex = index;
    this.hoveredSubPartType = type;
  }
  setSelected(index, type) {
    this.selectedSubPartIndex = index;
    this.selectedSubPartType = type;
    this.emit("selectedSubPartChanged");
  }
  selectHoveredSubPart() {
    this.selectedSubPartIndex = this.hoveredSubPartIndex;
    this.selectedSubPartType = this.hoveredSubPartType;
    this.emit("selectedSubPartChanged");
  }
  reconcile() {
    const data = this.lineGroup.canvas.app.state.getStateForId(
      this.lineGroup.id
    );
    if (
      (this.selectedSubPartType === C.SUB_PART_TYPES.ANCHOR_POINT &&
        !data.anchors[this.selectedSubPartIndex]) ||
      (this.selectedSubPartType === C.SUB_PART_TYPES.LINE_SEGMENT &&
        !data.lines[this.selectedSubPartIndex])
    ) {
      this.selectedSubPartIndex = null;
      this.selectedSubPartType = null;
    }
    if (
      (this.hoveredSubPartType === C.SUB_PART_TYPES.ANCHOR_POINT &&
        !data.anchors[this.hoveredSubPartIndex]) ||
      (this.hoveredSubPartType === C.SUB_PART_TYPES.LINE_SEGMENT &&
        !data.lines[this.hoveredSubPartIndex])
    ) {
      this.hoveredSubPartIndex = null;
      this.hoveredSubPartType = null;
    }
  }
  reset(resetSelection) {
    this.hoveredSubPartIndex = null;
    this.hoveredSubPartType = null;
    if (resetSelection) {
      this.selectedSubPartIndex = null;
      this.selectedSubPartType = null;
    }
  }
  getHoveredSubPart() {
    const data = this.lineGroup.canvas.app.state.getStateForId(
      this.lineGroup.id
    );
    if (this.hoveredSubPartType === C.SUB_PART_TYPES.LINE_SEGMENT) {
      return data.lines[this.hoveredSubPartIndex];
    } else if (this.hoveredSubPartType === C.SUB_PART_TYPES.ANCHOR_POINT) {
      return data.anchors[this.hoveredSubPartIndex];
    } else {
      return null;
    }
  }
  splitLineAtPoint(line, point) {
    const data = this.lineGroup.canvas.app.state.getStateForId(
      this.lineGroup.id,
      true
    );
    data.anchors.push({
      x: point.x,
      y: point.y,
      type: C.ANCHOR_TYPES.STANDALONE,
    });
    const newAnchorIndex = data.anchors.length - 1;
    data.lines.splice(this.hoveredSubPartIndex, 1);
    data.lines.push([line[0], newAnchorIndex]);
    data.lines.push([newAnchorIndex, line[1]]);
    this.selectedSubPartType = C.SUB_PART_TYPES.ANCHOR_POINT;
    this.selectedSubPartIndex = newAnchorIndex;
    this.lineGroup.saveState(data);
  }
  deleteSelectedSubPart(force) {
    if (!force) {
      if (
        this.selectedSubPartType === null ||
        this.lineGroup.isSelected === false
      ) {
        return;
      }
      if (this.lineGroup.canvas.selectionManager.selectedObjects.length > 1) {
        return;
      }
    }
    const selectedSubPartType = this.selectedSubPartType;
    const data = this.lineGroup.canvas.app.state.getStateForId(
      this.lineGroup.id,
      true
    );
    if (selectedSubPartType === C.SUB_PART_TYPES.ANCHOR_POINT) {
      this.deleteAnchorPoint(this.selectedSubPartIndex, data);
    } else if (selectedSubPartType === C.SUB_PART_TYPES.LINE_SEGMENT) {
      this.deleteLineSegment(this.selectedSubPartIndex, data);
    }
    this.selectedSubPartIndex = null;
    this.selectedSubPartType = null;
    if (data.lines.length === 0) {
      this.lineGroup.delete();
      return false;
    } else if (selectedSubPartType !== null) {
      this.lineGroup.saveState(data);
      return false;
    }
  }
  deleteAnchorPoint(index, data) {
    data.anchors[index] = null;
    var i = data.lines.length;
    while (i--) {
      if (data.lines[i][0] === index || data.lines[i][1] === index) {
        this.deleteLineSegment(i, data);
      }
    }
    if (
      this.selectedSubPartType === C.SUB_PART_TYPES.ANCHOR_POINT &&
      this.selectedSubPartIndex === index
    ) {
      this.selectedSubPartIndex = null;
      this.selectedSubPartType = null;
    }
    if (
      this.hoveredSubPartType === C.SUB_PART_TYPES.ANCHOR_POINT &&
      this.hoveredSubPartIndex === index
    ) {
      this.hoveredSubPartIndex = null;
      this.hoveredSubPartType = null;
    }
    if (
      this.lineGroup.canvas.app.interactionMode.getActiveMode() === "draw-lines"
    ) {
      this.lineGroup.canvas.app.interactionMode.endActiveMode();
    }
  }
  deleteLineSegment(index, data) {
    data.lines.splice(index, 1);
    var activeAnchorPointIndices = [],
      i;
    for (i = 0; i < data.lines.length; i++) {
      activeAnchorPointIndices = activeAnchorPointIndices.concat(data.lines[i]);
    }
    for (i = 0; i < data.anchors.length; i++) {
      if (activeAnchorPointIndices.indexOf(i) === -1) {
        data.anchors[i] = null;
      }
    }
  }
}
