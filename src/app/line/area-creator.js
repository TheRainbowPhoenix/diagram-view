import styles from "../common/styles";
import C from "../constants";
import Rectangle from "../geometry/rectangle";

export default class AreaCreator {
  constructor(canvas) {
    this.canvas = canvas;
    this.areaPreviewVisible = false;
    this.areaPreviewHelperPosition = null;
    this.previewPointPositionA = null;
  }
  showAreaPreview() {
    this.canvas.mouseProjector.on(
      C.EVENTS.EIGHTS_CELL_CHANGED,
      this.onMouseMove,
      this
    );
    this.canvas.mouseControls.on("mousedown", this.onMouseDown, this);
    this.canvas.mouseControls.on("mouseup", this.onMouseUp, this);
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  onMouseMove(point) {
    this.areaPreviewHelperPosition = point;
    this.areaPreviewVisible = true;
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  onMouseDown() {
    this.previewPointPositionA = this.areaPreviewHelperPosition.clone();
  }
  onMouseUp() {
    if (!this.previewPointPositionA) {
      return;
    }
    const rect = Rectangle.fromPoints(
      this.areaPreviewHelperPosition,
      this.previewPointPositionA
    );
    this.canvas.app.state.processTransaction({
      action: C.ACTIONS.CREATE,
      type: C.TYPES.AREA,
      id: this.canvas.app.state.generateId(),
      data: {
        anchors: rect.getAnchors(),
        lineColor: this.canvas.app.userSettings.get("areaLineColor"),
        lineWidth: this.canvas.app.userSettings.get("areaLineWidth"),
        fillColor: this.canvas.app.userSettings.get("areaFillColor"),
        shadowLevel: this.canvas.app.userSettings.get("areaShadowLevel"),
        zIndex: 0,
      },
    });
    this.canvas.app.interactionMode.endActiveMode();
  }
  endAreaPreview() {
    this.canvas.mouseProjector.off(
      C.EVENTS.EIGHTS_CELL_CHANGED,
      this.onMouseMove,
      this
    );
    this.canvas.mouseControls.off("mouseup", this.onMouseUp, this);
    this.canvas.mouseControls.off("mousedown", this.onMouseDown, this);
    this.areaPreviewVisible = false;
    this.areaPreviewHelperPosition = null;
    this.previewPointPositionA = null;
  }
}
