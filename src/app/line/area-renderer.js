import styles from "../common/styles";
import config from "../config";
import C from "../constants";
import Rectangle from "../geometry/rectangle";
import * as tools from "../tools/tools";

export default class AreaRenderer {
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
    this.canvas.pixelPlane.plane.on("render", this.drawAreas, this, 0);
  }
  drawInteractions() {
    if (this.canvas.linePlane.areaCreator.areaPreviewVisible) {
      this.drawAreaPreview();
    }
    const areas = this.canvas.layerManager.removeInvisible(
      this.canvas.app.objects.getAllOfType(C.TYPES.AREA)
    );
    for (var id in areas) {
      if (areas[id].isHovered) {
        this.drawHover(areas[id]);
      }
      if (areas[id].isSelected && areas[id].isEditable) {
        this.drawSelected(areas[id]);
      }
    }
  }
  drawHover(area) {
    const data = this.canvas.app.state.getStateForId(area.id);
    this.canvas.interactionPlane.plane.beginPath();
    this.canvas.interactionPlane.plane.moveTo(data.anchors[0]);
    for (var i = 1; i < data.anchors.length; i++) {
      this.canvas.interactionPlane.plane.lineTo(data.anchors[i]);
    }
    this.canvas.interactionPlane.plane.closePath();
    if (data.lineColor === styles.transparentColor) {
      this.canvas.interactionPlane.plane.setStrokeStyle(
        styles.area.transparentOutlineInteractionColor
      );
    } else {
      this.canvas.interactionPlane.plane.setStrokeStyle(data.lineColor);
      this.canvas.interactionPlane.plane.setLineWidth(data.lineWidth * 1.5);
    }
    this.canvas.interactionPlane.plane.stroke();
  }
  drawSelected(area) {
    const data = this.canvas.app.state.getStateForId(area.id);
    const anchorPointRadius =
      data.lineWidth + styles.lineDrawing.anchorPointToLineWidthOffset;
    var lineColor;
    if (data.lineColor === styles.transparentColor) {
      lineColor = styles.area.transparentOutlineInteractionColor;
    } else {
      lineColor = data.lineColor;
    }
    for (var i = 0; i < data.anchors.length; i++) {
      if (area.selectedAnchorIndex === i) {
        this.canvas.interactionPlane.plane.setFillStyle(
          lineColor.substring(0, 7) + "66"
        );
        this.canvas.interactionPlane.plane.drawCircle(
          data.anchors[i],
          anchorPointRadius + 0.2,
          false,
          true
        );
      } else if (area.hoveredAnchorIndex === i) {
        this.canvas.interactionPlane.plane.setFillStyle(
          lineColor.substring(0, 7) + styles.area.hoverHighlightOpacity
        );
        this.canvas.interactionPlane.plane.drawCircle(
          data.anchors[i],
          anchorPointRadius + 0.2,
          false,
          true
        );
      }
      this.canvas.interactionPlane.plane.setFillStyle(lineColor);
      this.canvas.interactionPlane.plane.drawCircle(
        data.anchors[i],
        anchorPointRadius,
        false,
        true
      );
    }
  }
  drawAreaPreview() {
    const plane = this.canvas.interactionPlane.plane;
    const pos = this.canvas.linePlane.areaCreator.areaPreviewHelperPosition;
    this.drawAreaPreviewHelper(
      this.canvas.linePlane.areaCreator.areaPreviewHelperPosition,
      plane
    );
    if (this.canvas.linePlane.areaCreator.previewPointPositionA) {
      plane.setFillStyle("#e6189833");
      plane.fillRect(
        Rectangle.fromPoints(
          this.canvas.linePlane.areaCreator.areaPreviewHelperPosition,
          this.canvas.linePlane.areaCreator.previewPointPositionA
        )
      );
      this.drawAreaPreviewHelper(
        this.canvas.linePlane.areaCreator.previewPointPositionA,
        plane
      );
    }
  }
  drawAreaPreviewHelper(pos, plane) {
    const w = 0.2;
    plane.setStrokeStyle("#e61898");
    plane.setLineWidth(0.04);
    plane.beginPath();
    plane.moveTo({
      x: pos.x - w,
      y: pos.y,
    });
    plane.lineTo({
      x: pos.x + w,
      y: pos.y,
    });
    plane.moveTo({
      x: pos.x,
      y: pos.y - w,
    });
    plane.lineTo({
      x: pos.x,
      y: pos.y + w,
    });
    plane.stroke();
  }
  drawAreas() {
    var areaStates;
    areaStates = window.canvas.app.state.getAllOfType(C.TYPES.AREA);
    areaStates = this.canvas.layerManager.removeInvisible(areaStates);
    areaStates = tools.mapToArray(areaStates);
    areaStates.sort((a, b) => {
      if (a.data.zIndex === b.data.zIndex) {
        return 0;
      } else if (a.data.zIndex > b.data.zIndex) {
        return 1;
      } else {
        return -1;
      }
    });
    var i, j;
    const plane = this.canvas.pixelPlane.plane;
    for (i = 0; i < areaStates.length; i++) {
      plane.beginPath();
      plane.moveTo(areaStates[i].data.anchors[0]);
      for (j = 1; j < areaStates[i].data.anchors.length; j++) {
        plane.lineTo(areaStates[i].data.anchors[j]);
      }
      plane.closePath();
      plane.setFillStyle(areaStates[i].data.fillColor);
      plane.setStrokeStyle(areaStates[i].data.lineColor);
      plane.setLineWidth(areaStates[i].data.lineWidth);
      plane.setShadowLevel(areaStates[i].data.shadowLevel);
      plane.fill();
      plane.stroke();
      plane.setShadowLevel(0);
      plane.fill();
      plane.stroke();
    }
  }
}
