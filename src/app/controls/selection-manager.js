import C from "../constants";
import KEYS from "./keys";
import config from "../config";
// SelectionRectangle
import * as tools from "../tools/tools";
import EventEmitter from "../tools/event-emitter";
import SelectionRectangle from "./selection-rectangle";

export default class SelectionManager extends EventEmitter {
  constructor(canvas) {
    super();
    this.propagateSelectionChangeTimeout = null;
    this.canvas = canvas;
    this.canvas.mouseControls.on("mousedown", this.onMouseDown, this, 1);
    this.canvas.mouseControls.on("dblclick", this.onDblClick, this, 1);
    this.canvas.mouseControls.on("mouseup", this.onMouseUp, this, 3);
    this.canvas.app.eventHub.on(
      "user-cancel",
      this.clearCurrentSelection,
      this,
      3
    );
    this.selectedObjects = [];
    this.selectionRectangle = new SelectionRectangle(
      this.canvas,
      this.applyRectangleSelection.bind(this)
    );
    this.canvas.keyboardControls.on(
      "delete",
      this.deleteSelectedObjects,
      this,
      2
    );
  }
  applyRectangleSelection(rectangle) {
    this.clearCurrentSelection();
    this.addMultipleObjectsToSelection(
      this.canvas.app.objectFinder.getObjectsWithinRectangle(rectangle)
    );
  }
  deleteSelectedObjects() {
    this.canvas.app.state.startTransactionBlock("deleted multiple objects");
    const selectedObjects = this.selectedObjects.splice(0);
    for (var i = 0; i < selectedObjects.length; i++) {
      if (selectedObjects[i].delete) {
        selectedObjects[i].delete();
      }
    }
    this.canvas.app.state.endTransactionBlock();
  }
  onDblClick(event) {
    if (this.canvas.app.interactionMode.getActiveMode() !== "select") {
      return;
    }
    var clickedObjects =
      this.canvas.app.objectFinder.getObjectsForMouseEvent(event);
    if (clickedObjects.length !== 1) {
      return;
    }
    if (
      (clickedObjects[0].type === C.TYPES.LINE_GROUP ||
        clickedObjects[0].type === C.TYPES.AREA) &&
      clickedObjects[0].isSelected
    ) {
      return;
    }
    this.clearCurrentSelection();
    const selectedType = clickedObjects[0].type;
    var allOfType = tools.mapToArray(
      this.canvas.app.objects.getAllOfType(selectedType)
    );
    if (selectedType === C.TYPES.COMPONENT) {
      allOfType = allOfType.filter((obj) => {
        return obj.config.id === clickedObjects[0].config.id;
      });
    }
    this.addMultipleObjectsToSelection(allOfType);
  }
  onMouseDown(event) {
    if (this.canvas.app.interactionMode.getActiveMode() !== "select") {
      return;
    }
    var clickedObjects =
      this.canvas.app.objectFinder.getObjectsForMouseEvent(event);
    var i;
    for (i = 0; i < clickedObjects.length; i++) {
      if (clickedObjects[i].isSelected) {
        if (this.canvas.keyboardControls.pressedKeys[KEYS.CTRL]) {
          this.removeObjectFromSelection(clickedObjects[i]);
        }
        return;
      }
    }
    this.clearCurrentSelection();
    var addedObject = false;
    for (i = 0; i < clickedObjects.length; i++) {
      if (clickedObjects[i].isSelectable) {
        if (clickedObjects[i].isSelected) {
          this.removeObjectFromSelection(clickedObjects[i]);
        } else {
          if (addedObject === false) {
            addedObject = true;
            this.addObjectToSelection(clickedObjects[i]);
          }
        }
      }
    }
    this.propagateSelectionChange();
  }
  onMouseUp(event) {
    if (this.canvas.app.interactionMode.getActiveMode() !== "select") {
      return;
    }
    if (this.canvas.keyboardControls.pressedKeys[KEYS.CTRL]) {
      return;
    }
    var clickedObjects =
      this.canvas.app.objectFinder.getObjectsForMouseEvent(event);
    if (clickedObjects.length !== 1) {
      return;
    }
    if (this.selectedObjects.length > 1) {
      this.clearCurrentSelection();
      this.addObjectToSelection(clickedObjects[0]);
    }
    this.propagateSelectionChange();
  }
  clearCurrentSelection(force) {
    var ctrlPressed = !!this.canvas.keyboardControls.pressedKeys[KEYS.CTRL];
    if (ctrlPressed && !force) {
      return;
    }
    for (var i = 0; i < this.selectedObjects.length; i++) {
      if (this.selectedObjects[i].hideSelected() === false) {
        return;
      }
    }
    this.selectedObjects = [];
    this.propagateSelectionChange();
  }
  removeObjectFromSelection(obj) {
    var index = this.selectedObjects.indexOf(obj);
    if (index > -1) {
      this.selectedObjects.splice(index, 1);
    }
    obj.hideSelected();
    this.propagateSelectionChange();
  }
  addMultipleObjectsToSelection(objects) {
    for (var id in objects) {
      if (
        objects[id].isSelectable &&
        this.selectedObjects.indexOf(objects[id]) === -1
      ) {
        if (
          this.canvas.app.$refs.viewControls.isDashboardMode &&
          objects[id].type !== C.TYPES.COMPONENT
        ) {
          continue;
        }
        this.selectedObjects.push(objects[id]);
        objects[id].showSelected(
          objects.length > 1 || this.selectedObjects.length > 1
        );
      }
    }
    this.propagateSelectionChange();
  }
  addObjectToSelection(obj) {
    if (
      this.canvas.app.$refs.viewControls.isDashboardMode &&
      obj.type !== C.TYPES.COMPONENT
    ) {
      this.propagateSelectionChange();
      return;
    }
    if (this.selectedObjects.indexOf(obj) === -1) {
      this.selectedObjects.push(obj);
    }
    obj.showSelected();
    this.propagateSelectionChange();
  }
  propagateSelectionChange() {
    if (this.propagateSelectionChangeTimeout === null) {
      this.propagateSelectionChangeTimeout = setTimeout(
        this.onSelectionChange.bind(this),
        0
      );
    }
  }
  onSelectionChange() {
    this.propagateSelectionChangeTimeout = null;
    this.canvas.interactionPlane.plane.scheduleRender();
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else if (document.selection) {
      document.selection.empty();
    }
    this.emit("selection-change", this.selectedObjects);
  }
}
