import C from "../../constants";

export default class ComponentGhost {
  constructor(canvas, plane) {
    this.canvas = canvas;
    this.plane = plane;
    this.ghostId = null;
  }
  show(componentId) {
    const createTransition =
      this.canvas.app.objectCreator.getComponentCreateTransition(componentId);
    createTransition.data.position.x = -2e3;
    createTransition.data.position.y = -2e3;
    createTransition.data.opacity = 0.5;
    this.ghostId = createTransition.id;
    this.canvas.app.state.startTransientPhase();
    this.canvas.app.state.processTransaction(createTransition);
    this.canvas.mouseProjector.on(
      C.EVENTS.HALF_CELL_CHANGED,
      this.update,
      this
    );
    this.canvas.mouseControls.on("click", this.place, this);
    this.canvas.selectionManager.clearCurrentSelection();
    this.canvas.selectionManager.addObjectToSelection(
      this.canvas.app.objects.getById(this.ghostId)
    );
  }
  remove() {
    this.end();
  }
  update(point) {
    this.canvas.app.state.processTransaction({
      action: C.ACTIONS.UPDATE,
      id: this.ghostId,
      data: {
        position: point.getSerializable(),
      },
    });
  }
  place() {
    const data = this.canvas.app.state.getStateForId(this.ghostId, true);
    data.opacity = this.canvas.app.userSettings.get("componentOpacity");
    this.canvas.app.state.endTransientPhase();
    this.canvas.app.state.processTransaction({
      action: C.ACTIONS.CREATE,
      type: C.TYPES.COMPONENT,
      id: this.canvas.app.state.generateId(),
      data: data,
    });
    this.canvas.app.state.startTransientPhase();
  }
  end() {
    if (this.ghostId) {
      this.canvas.app.state.processTransaction({
        action: C.ACTIONS.DELETE,
        id: this.ghostId,
      });
    }
    this.canvas.mouseProjector.off(
      C.EVENTS.HALF_CELL_CHANGED,
      this.update,
      this
    );
    this.canvas.mouseControls.off("click", this.place, this);
    this.ghostId = null;
    this.canvas.app.state.endTransientPhase();
  }
}
