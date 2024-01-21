import styles from "../common/styles";
import config from "../config";
import C from "../constants";
import * as lineTools from "./line-tools";

export default class LineRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    setTimeout(this.init.bind(this), 0);
  }
  init() {
    this.canvas.interactionPlane.plane.on(
      "render",
      this.drawInteractions,
      this,
      0
    );
    this.canvas.pixelPlane.plane.on("render", this.drawLines, this, 1);
  }
  drawLines() {
    const lineGroups = this.canvas.layerManager.removeInvisible(
      this.canvas.app.state.getAllOfType(C.TYPES.LINE_GROUP)
    );
    for (var id in lineGroups) {
      this.drawLinesForGroup(
        lineGroups[id],
        lineGroups[id].data.lines,
        this.canvas.pixelPlane.plane,
        lineGroups[id].data.strokeStyle,
        lineGroups[id].data.lineWidth,
        lineGroups[id].data.lineDash
      );
      this.drawArrowsForGroup(lineGroups[id].data);
    }
  }
  drawInteractions() {
    const lineGroups = this.canvas.layerManager.removeInvisible(
      this.canvas.app.objects.getAllOfType(C.TYPES.LINE_GROUP)
    );
    for (var id in lineGroups) {
      this.drawInteractionsForGroup(id, lineGroups[id]);
    }
    if (window.canvas.app.interactionMode.getActiveMode() === "draw-lines") {
      this.drawObjectAnchorPoints();
      this.drawLineHelper();
    }
  }
  drawObjectAnchorPoints() {
    const components = this.canvas.app.objects.getAllOfType(C.TYPES.COMPONENT);
    if (!components || components.length === 0) {
      return;
    }
    this.canvas.interactionPlane.plane.setFillStyle(
      styles.objectAnchorPoint.color
    );
    var id, j;
    for (id in components) {
      for (j = 0; j < components[id].anchorPoints.anchors.length; j++) {
        this.canvas.interactionPlane.plane.drawCircle(
          components[id].anchorPoints.anchors[j],
          styles.objectAnchorPoint.radius,
          false,
          true
        );
      }
    }
  }
  drawLineHelper() {
    this.canvas.interactionPlane.plane.setLineWidth(
      this.canvas.app.userSettings.get("lineWidth")
    );
    this.canvas.interactionPlane.plane.setStrokeStyle(
      this.canvas.app.userSettings.get("lineColor")
    );
    if (this.canvas.linePlane.currentTargetPoint) {
      this.canvas.interactionPlane.plane.setLineDash(
        styles.lineHelper.lineDash
      );
      this.canvas.interactionPlane.plane.setLineWidth(
        styles.lineHelper.lineWidth
      );
      this.canvas.interactionPlane.plane.drawCircle(
        this.canvas.linePlane.currentTargetPoint,
        styles.lineHelper.radius,
        true,
        false
      );
      this.canvas.interactionPlane.plane.setLineDash([]);
    }
    if (!this.canvas.linePlane.activeLineGroup) {
      return;
    }
    if (this.canvas.linePlane.activeLineGroup) {
      const data = this.canvas.app.state.getStateForId(
        this.canvas.linePlane.activeLineGroup.id
      );
      this.canvas.interactionPlane.plane.setStrokeStyle(data.strokeStyle);
      this.canvas.interactionPlane.plane.setLineWidth(data.lineWidth);
    }
    const selectedAnchor =
      this.canvas.linePlane.activeLineGroup.getSelectedAnchor();
    if (selectedAnchor && this.canvas.linePlane.currentTargetPoint) {
      this.canvas.interactionPlane.plane.beginPath();
      this.canvas.interactionPlane.plane.moveTo(
        lineTools.toAnchorPoint(selectedAnchor)
      );
      this.canvas.interactionPlane.plane.lineTo(
        this.canvas.linePlane.currentTargetPoint
      );
      this.canvas.interactionPlane.plane.stroke();
    }
  }
  drawLinesForGroup(group, lines, plane, style, width, lineDash) {
    const data = group.id
      ? this.canvas.app.state.getStateForId(group.id)
      : group.data;
    const arrowWidth = data.lineWidth * 5;
    var i,
      anchorA = null,
      anchorB = null;
    plane.setStrokeStyle(style);
    plane.setFillStyle(style);
    plane.setLineWidth(width);
    if (lineDash) {
      plane.setLineDash(styles.lineDrawing.lineDash[lineDash]);
    }
    plane.beginPath();
    for (i = 0; i < lines.length; i++) {
      anchorA = lineTools.toAnchorPoint(data.anchors[lines[i][0]]);
      if (data.arrowAnchorIndices[lines[i][0]]) {
        anchorA = this.adjustForArrowHead(
          anchorA,
          lineTools.toAnchorPoint(data.anchors[lines[i][1]]),
          arrowWidth
        );
      }
      if (!anchorB || anchorB.x !== anchorA.x || anchorB.y !== anchorA.y) {
        plane.moveTo(anchorA);
      }
      anchorB = lineTools.toAnchorPoint(data.anchors[lines[i][1]]);
      if (data.arrowAnchorIndices[lines[i][1]]) {
        anchorB = this.adjustForArrowHead(anchorB, anchorA, arrowWidth);
      }
      plane.lineTo(anchorB);
    }
    plane.stroke();
    plane.setLineDash([]);
  }
  drawArrowsForGroup(data) {
    for (var i = 0; i < data.lines.length; i++) {
      if (data.arrowAnchorIndices[data.lines[i][0]]) {
        this.drawArrow(
          lineTools.toAnchorPoint(data.anchors[data.lines[i][0]]),
          lineTools.toAnchorPoint(data.anchors[data.lines[i][1]]),
          data.lineWidth * 5
        );
      }
      if (data.arrowAnchorIndices[data.lines[i][1]]) {
        this.drawArrow(
          lineTools.toAnchorPoint(data.anchors[data.lines[i][1]]),
          lineTools.toAnchorPoint(data.anchors[data.lines[i][0]]),
          data.lineWidth * 5
        );
      }
    }
  }
  adjustForArrowHead(pa, pb, arrowWidth) {
    const angle = Math.atan2(pa.y - pb.y, pa.x - pb.x);
    const x1 = pa.x - arrowWidth * Math.cos(angle - Math.PI / 6);
    const y1 = pa.y - arrowWidth * Math.sin(angle - Math.PI / 6);
    const x2 = pa.x - arrowWidth * Math.cos(angle + Math.PI / 6);
    const y2 = pa.y - arrowWidth * Math.sin(angle + Math.PI / 6);
    return {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2,
    };
  }
  drawArrow(pa, pb, arrowWidth) {
    var angle = Math.atan2(pa.y - pb.y, pa.x - pb.x);
    const plane = this.canvas.pixelPlane.plane;
    plane.beginPath();
    plane.moveTo(pa);
    plane.lineTo({
      x: pa.x - arrowWidth * Math.cos(angle - Math.PI / 6),
      y: pa.y - arrowWidth * Math.sin(angle - Math.PI / 6),
    });
    plane.lineTo({
      x: pa.x - arrowWidth * Math.cos(angle + Math.PI / 6),
      y: pa.y - arrowWidth * Math.sin(angle + Math.PI / 6),
    });
    plane.closePath();
    plane.fill();
  }
  drawSubparts(group, hoverStyle, hoverWidth) {
    const data = this.canvas.app.state.getStateForId(group.id);
    if (group.subparts.hoveredSubPartType === C.SUB_PART_TYPES.LINE_SEGMENT) {
      this.drawLinesForGroup(
        group,
        [data.lines[group.subparts.hoveredSubPartIndex]],
        this.canvas.interactionPlane.plane,
        hoverStyle,
        hoverWidth
      );
    }
    if (group.subparts.selectedSubPartType === C.SUB_PART_TYPES.LINE_SEGMENT) {
      this.drawLinesForGroup(
        group,
        [data.lines[group.subparts.selectedSubPartIndex]],
        this.canvas.interactionPlane.plane,
        hoverStyle,
        hoverWidth
      );
    }
    if (group.subparts.hoveredSubPartType === C.SUB_PART_TYPES.ANCHOR_POINT) {
      this.canvas.interactionPlane.plane.setFillStyle(hoverStyle);
      this.canvas.interactionPlane.plane.drawCircle(
        lineTools.toAnchorPoint(
          data.anchors[group.subparts.hoveredSubPartIndex]
        ),
        data.lineWidth + styles.lineDrawing.anchorPointToLineWidthOffset * 2,
        false,
        true
      );
    }
    if (group.subparts.selectedSubPartType === C.SUB_PART_TYPES.ANCHOR_POINT) {
      this.canvas.interactionPlane.plane.setFillStyle(hoverStyle);
      this.canvas.interactionPlane.plane.drawCircle(
        lineTools.toAnchorPoint(
          data.anchors[group.subparts.selectedSubPartIndex]
        ),
        data.lineWidth + styles.lineDrawing.anchorPointToLineWidthOffset * 2,
        false,
        true
      );
    }
  }
  drawAnchorPoints(group) {
    const data = this.canvas.app.state.getStateForId(group.id);
    this.canvas.interactionPlane.plane.setFillStyle(
      data.strokeStyle.substring(0, 7) + styles.lineDrawing.anchorPointOpacity
    );
    this.canvas.interactionPlane.plane.setStrokeStyle(data.strokeStyle);
    this.canvas.interactionPlane.plane.setLineWidth(data.lineWidth);
    for (var i = 0; i < data.anchors.length; i++) {
      if (data.anchors[i] === null) {
        continue;
      }
      if (data.anchors[i].type === C.ANCHOR_TYPES.STANDALONE) {
        this.canvas.interactionPlane.plane.drawCircle(
          lineTools.toAnchorPoint(data.anchors[i]),
          data.lineWidth + styles.lineDrawing.anchorPointToLineWidthOffset,
          false,
          true
        );
      } else if (data.anchors[i].type === C.ANCHOR_TYPES.OBJECT) {
        this.canvas.interactionPlane.plane.setLineWidth(data.lineWidth);
        this.canvas.interactionPlane.plane.drawCircle(
          lineTools.toAnchorPoint(data.anchors[i]),
          data.lineWidth * 3.5,
          true,
          false
        );
        this.canvas.interactionPlane.plane.drawCircle(
          lineTools.toAnchorPoint(data.anchors[i]),
          data.lineWidth * 2,
          false,
          true
        );
      }
    }
  }
  drawInteractionsForGroup(id, group) {
    const data = this.canvas.app.state.getStateForId(id);
    const hoverStyle =
      data.strokeStyle.substring(0, 7) +
      styles.lineDrawing.hoverHighlightOpacity;
    const hoverWidth = data.lineWidth + styles.lineDrawing.hoverHighlightWidth;
    if (
      (group.isSelected && group.isEditable) ||
      (window.canvas.app.interactionMode.getActiveMode() === "draw-lines" &&
        window.canvas.linePlane.activeLineGroup === group)
    ) {
      this.drawSubparts(group, hoverStyle, hoverWidth);
      this.drawAnchorPoints(group);
    } else if (group.isHovered) {
      this.drawLinesForGroup(
        group,
        data.lines,
        this.canvas.interactionPlane.plane,
        hoverStyle,
        hoverWidth
      );
    }
  }
}
