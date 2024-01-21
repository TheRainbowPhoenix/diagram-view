import C from "../constants";

const modes = {};

modes[C.INTERACTION_MODE.PLACE_COMPONENT] = {
  name: C.INTERACTION_MODE.PLACE_COMPONENT,
  start: (canvas, data) => {
    canvas.interactionPlane.interactions.componentGhost.show(data.componentId);
  },
  stop: function (canvas) {
    canvas.interactionPlane.interactions.componentGhost.remove();
  },
};
modes[C.INTERACTION_MODE.ADD_WIDGET] = {
  name: C.INTERACTION_MODE.ADD_WIDGET,
  start: function (canvas) {
    canvas.widgetManager.startAdd();
  },
  stop: function (canvas) {
    canvas.widgetManager.stopAdd();
  },
};
modes[C.INTERACTION_MODE.PAN] = {
  name: C.INTERACTION_MODE.PAN,
  returnToPreviousMode: true,
  start: function (canvas) {
    canvas.camera.startPan();
  },
  stop: function (canvas) {
    canvas.camera.stopPan();
  },
};
modes[C.INTERACTION_MODE.PAN_ON_DRAG] = {
  name: C.INTERACTION_MODE.PAN_ON_DRAG,
  returnToPreviousMode: true,
  stopPan: function () {
    window.canvas.camera.stopPan(true);
  },
  start: function (canvas) {
    document.body.classList.add("pan");
    canvas.mouseControls.on("mousedown", canvas.camera.startPan, canvas.camera);
    canvas.mouseControls.on("mouseup", this.stopPan, this);
  },
  stop: function (canvas) {
    document.body.classList.remove("pan");
    canvas.mouseControls.off(
      "mousedown",
      canvas.camera.startPan,
      canvas.camera
    );
    canvas.mouseControls.off("mouseup", this.stopPan, this);
  },
};
modes[C.INTERACTION_MODE.DRAW_LINES] = {
  name: C.INTERACTION_MODE.DRAW_LINES,
  start: function (canvas, lineGroup) {
    canvas.linePlane.start(lineGroup || null);
  },
  stop: function () {
    window.canvas.linePlane.stop();
  },
};
modes[C.INTERACTION_MODE.DRAW_AREA] = {
  name: C.INTERACTION_MODE.DRAW_AREA,
  start: function (canvas) {
    canvas.linePlane.startArea();
  },
  stop: function (canvas) {
    canvas.linePlane.stopArea();
  },
};
modes[C.INTERACTION_MODE.ADD_LABEL] = {
  name: C.INTERACTION_MODE.ADD_LABEL,
  start: function (canvas) {
    canvas.pixelPlane.startAddLabel();
  },
  stop: function (canvas) {
    canvas.pixelPlane.stopAdd();
  },
};
modes[C.INTERACTION_MODE.ADD_ICON] = {
  name: C.INTERACTION_MODE.ADD_ICON,
  start: function (canvas) {
    canvas.pixelPlane.startAddIcon();
  },
  stop: function (canvas) {
    canvas.pixelPlane.stopAdd();
  },
};
modes[C.INTERACTION_MODE.ADD_IMAGE] = {
  name: C.INTERACTION_MODE.ADD_IMAGE,
  start: function (canvas) {
    canvas.pixelPlane.startAddImage();
  },
  stop: function (canvas) {
    canvas.pixelPlane.stopAdd();
  },
};

const MODES = modes;

export default MODES;
