import EventEmitter from "../tools/event-emitter";

export default class ObjectRegistry extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.objects = {};
    this.objectsByType = {};
  }
  getAll() {
    return this.objects;
  }
  callMethodOnObjects(methodName, type) {
    const results = {};
    const objects = type ? this.getAllOfType(type) : this.objects;
    for (var id in objects) {
      results[id] = objects[id][methodName]();
    }
    return results;
  }
  add(object) {
    this.objects[object.id] = object;
    if (!this.objectsByType[object.type]) {
      this.objectsByType[object.type] = {};
    }
    this.objectsByType[object.type][object.id] = object;
    this.emit("change");
  }
  remove(object) {
    if (!object) {
      return;
    }
    delete this.objects[object.id];
    delete this.objectsByType[object.type][object.id];
    if (object.isSelected) {
      this.canvas.selectionManager.clearCurrentSelection(true);
    }
    object.destroy();
    this.emit("change");
  }
  removeById(id) {
    this.remove(this.getById(id));
  }
  getById(id) {
    return this.objects[id];
  }
  getAllOfType(type) {
    if (!this.objectsByType[type]) {
      return {};
    } else {
      return this.objectsByType[type];
    }
  }
}
