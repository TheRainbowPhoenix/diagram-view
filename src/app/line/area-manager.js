import Area from "./area";

export default class AreaManager {
  constructor(canvas) {
    this.canvas = canvas;
  }
  init() {
    this.canvas.app.state.on("create-area", this.onAreaCreated, this);
    this.canvas.app.state.on("update-area", this.onAreaUpdated, this);
    this.canvas.app.state.on("delete-area", this.onAreaDeleted, this);
  }
  onAreaCreated(transaction) {
    this.canvas.app.objects.add(new Area(this.canvas, transaction.id));
    this.canvas.interactionPlane.plane.scheduleRender();
    this.canvas.pixelPlane.plane.scheduleRender();
  }
  onAreaUpdated() {
    this.canvas.interactionPlane.plane.scheduleRender();
    this.canvas.pixelPlane.plane.scheduleRender();
  }
  onAreaDeleted(transaction) {
    this.canvas.app.objects.removeById(transaction.id);
    this.canvas.interactionPlane.plane.scheduleRender();
    this.canvas.pixelPlane.plane.scheduleRender();
  }
}
