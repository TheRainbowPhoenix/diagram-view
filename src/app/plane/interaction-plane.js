import C from "../constants";
import style from "../common/styles";
import AbstractPlane from "./abstract-plane";
import ComponentGhost from "../obj/components/ghost";

export default class InteractionPlane {
  constructor(canvas) {
    this.canvas = canvas;
    this.plane = new AbstractPlane(this.canvas, 0.015);
    this.interactions = {};
    this.interactions.componentGhost = new ComponentGhost(this.canvas, this);
    this.highlightRectangle = null;
    this.highlightColor = null;
    this.indicatePosition = null;
    this.indicateDimensionValue = null;
    this.indicateDimension = null;
    this.plane.on("render", this.render, this);
    setTimeout(this.init.bind(this), 1);
  }
  init() {
    this.canvas.selectionManager.on(
      "selection-change",
      this.plane.scheduleRender,
      this.plane
    );
  }
  highlightArea(rectangle, color) {
    this.highlightRectangle = rectangle;
    this.highlightColor = color;
    this.plane.scheduleRender();
  }
  drawPositionIndicator(position) {
    this.indicatePosition = position;
    this.plane.scheduleRender();
  }
  hidePositionIndicator() {
    this.indicatePosition = null;
    this.plane.scheduleRender();
  }
  drawSingleDimensionIndicator(value, dimension) {
    this.indicateDimensionValue = value;
    this.indicateDimension = dimension;
    this.plane.scheduleRender();
  }
  hideSingleDimensionIndicator() {
    this.indicateDimensionValue = null;
    this.indicateDimension = null;
    this.plane.scheduleRender();
  }
  render() {
    if (this.highlightRectangle) {
      this.plane.setFillStyle(this.highlightColor);
      this.plane.fillRect(this.highlightRectangle);
      this.highlightRectangle = null;
      this.highlightColor = null;
    }
    if (this.indicatePosition) {
      const p = this.indicatePosition;
      this.plane.beginPath();
      this.plane.moveTo({
        x: p.x,
        y: p.y - 100,
      });
      this.plane.lineTo({
        x: p.x,
        y: p.y + 100,
      });
      this.plane.moveTo({
        x: p.x - 100,
        y: p.y,
      });
      this.plane.lineTo({
        x: p.x + 100,
        y: p.y,
      });
      this.plane.setStrokeStyle(style.highlighting.positionIndicatorLineColor);
      this.plane.setLineDash([0.2, 0.1]);
      this.plane.setLineWidth(0.01);
      this.plane.stroke();
      this.plane.setLineDash([0]);
    }
    if (this.indicateDimension) {
      this.plane.beginPath();
      this.plane.setLineWidth(0.01);
      this.plane.setStrokeStyle(style.highlighting.dimensionIndicatorLineColor);
      if (this.indicateDimension === "x") {
        this.plane.moveTo({
          x: this.indicateDimensionValue,
          y: -100,
        });
        this.plane.lineTo({
          x: this.indicateDimensionValue,
          y: 100,
        });
      } else {
        this.plane.moveTo({
          x: -100,
          y: this.indicateDimensionValue,
        });
        this.plane.lineTo({
          x: 100,
          y: this.indicateDimensionValue,
        });
      }
      this.plane.stroke();
    }
    const objects = this.canvas.app.objects.getAll();
    for (var id in objects) {
      if (
        C.BOX_SELECTION_TYPES[objects[id].type] ||
        objects[id].isBoxSelectionType
      ) {
        if (objects[id].isSelected) {
          this.renderSelectionBox(objects[id], this.getLayerColor(id, false));
        } else if (objects[id].isHovered) {
          this.renderSelectionBox(objects[id], this.getLayerColor(id, true));
        }
      }
    }
  }
  getLayerColor(objectId, isHovered) {
    const layer = this.canvas.layerManager.getLayerForObject(objectId);
    if (layer) {
      if (isHovered) {
        return layer.color + "99";
      } else {
        return layer.color;
      }
    } else if (isHovered) {
      return style.selection.selectColor;
    } else {
      return style.selection.hoverColor;
    }
  }
  renderSelectionBox(object, strokeStyle) {
    const bb = object.computeBoundingBox();
    const w = style.selection.selectionBoxSideLength;
    const p = style.selection.selectionBoxPadding;
    const x1 = bb.x1 - p;
    const y1 = bb.y1 - p;
    const x2 = bb.x2 + p;
    const y2 = bb.y2 + p;
    this.plane.setStrokeStyle(strokeStyle);
    this.plane.beginPath();
    this.plane.moveTo({
      x: x1,
      y: y1 + w,
    });
    this.plane.lineTo({
      x: x1,
      y: y1,
    });
    this.plane.lineTo({
      x: x1 + w,
      y: y1,
    });
    this.plane.moveTo({
      x: x2 - w,
      y: y1,
    });
    this.plane.lineTo({
      x: x2,
      y: y1,
    });
    this.plane.lineTo({
      x: x2,
      y: y1 + w,
    });
    this.plane.moveTo({
      x: x2,
      y: y2 - w,
    });
    this.plane.lineTo({
      x: x2,
      y: y2,
    });
    this.plane.lineTo({
      x: x2 - w,
      y: y2,
    });
    this.plane.moveTo({
      x: x1 + w,
      y: y2,
    });
    this.plane.lineTo({
      x: x1,
      y: y2,
    });
    this.plane.lineTo({
      x: x1,
      y: y2 - w,
    });
    this.plane.setLineWidth(style.selection.selectionBoxLineWidth);
    this.plane.stroke();
  }
}
