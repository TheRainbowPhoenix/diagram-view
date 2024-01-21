import Rectangle from "../geometry/rectangle";
import C from "../constants";
import config from "../config";

export default class PixelPlaneInteractions {
  constructor(canvas) {
    this.canvas = canvas;
    this.highlightRectangle = new Rectangle(0, 0, 0, 0);
    this.highlight = false;
    this.currentId = null;
  }
  showAddPosition(width, height) {
    this.highlightRectangle.setDimensions(width, height);
    this.canvas.app.state.startTransientPhase();
    this.currentId = this.canvas.pixelPlane.createPixelObjectState(
      this.highlightRectangle
    );
    this.canvas.mouseProjector.on(
      C.EVENTS.HALF_CELL_CHANGED,
      this.updateAddPosition,
      this
    );
    this.canvas.mouseControls.on("mouseup", this.onAddConfirmed, this);
  }
  updateAddPosition(point) {
    this.canvas.app.state.processTransaction({
      id: this.currentId,
      action: C.ACTIONS.UPDATE,
      data: {
        position: point.getSerializable(),
      },
    });
  }
  onAddConfirmed() {
    const data = this.canvas.app.state.getStateForId(this.currentId);
    this.endAdd();
    this.canvas.app.state.processTransaction({
      id: this.canvas.app.state.generateId(),
      action: C.ACTIONS.CREATE,
      type: this.canvas.pixelPlane.addType,
      data: data,
    });
  }
  endAdd() {
    this.canvas.mouseProjector.off(
      C.EVENTS.HALF_CELL_CHANGED,
      this.updateAddPosition,
      this
    );
    this.canvas.mouseControls.off("mouseup", this.onAddConfirmed, this);
    if (this.currentId) {
      this.canvas.app.state.processTransaction({
        id: this.currentId,
        action: C.ACTIONS.DELETE,
      });
    }
    this.currentId = null;
    this.canvas.app.state.endTransientPhase();
    this.canvas.interactionPlane.plane.scheduleRender();
  }
}
