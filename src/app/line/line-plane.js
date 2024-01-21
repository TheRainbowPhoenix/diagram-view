import config from "../config";
import C from "../constants";
import LineGroup from "./line-group";
import * as tools from "../tools/tools";
import AreaCreator from "./area-creator";
import AreaRenderer from "./area-renderer";
import AreaManager from "./area-manager";
import LineRenderer from "./line-renderer";
import * as lineTools from "./line-tools";

export default class LinePlane {
  constructor(canvas) {
    this.canvas = canvas;
    this.areaCreator = new AreaCreator(this.canvas);
    this.areaRenderer = new AreaRenderer(this.canvas);
    this.areaManager = new AreaManager(this.canvas);
    this.renderer = new LineRenderer(this.canvas);
    this.activeLineGroup = null;
    this.currentTargetPoint = null;
    this.createInProgress = false;
    this.boundingBoxes = [];
    setTimeout(this.init.bind(this), 1);
  }
  init() {
    this.canvas.app.state.on(
      "create-line-group",
      this.onLineGroupCreated,
      this
    );
    this.canvas.app.state.on(
      "update-line-group",
      this.onLineGroupUpdated,
      this
    );
    this.canvas.app.state.on(
      "delete-line-group",
      this.onLineGroupDeleted,
      this
    );
    this.areaManager.init();
  }
  start(lineGroup) {
    this.currentTargetPoint =
      this.canvas.mouseProjector.halfCellIntersectionPos.clone();
    this.activeLineGroup = lineGroup || null;
    setTimeout(() => {
      this.canvas.mouseControls.on("mouseup", this.onMouseUp, this, 3);
      this.canvas.mouseProjector.on(
        C.EVENTS.HALF_CELL_INTERSECTION_CHANGED,
        this.onMouseMove,
        this
      );
    }, 0);
  }
  stop() {
    this.canvas.mouseControls.off("mouseup", this.onMouseUp, this);
    this.canvas.mouseProjector.off(
      C.EVENTS.HALF_CELL_INTERSECTION_CHANGED,
      this.onMouseMove,
      this
    );
    if (this.activeLineGroup && this.activeLineGroup.subparts) {
      this.activeLineGroup.subparts.reset(true);
    }
    this.currentTargetPoint = null;
    this.activeLineGroup = null;
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  startArea() {
    this.areaCreator.showAreaPreview();
  }
  stopArea() {
    this.areaCreator.endAreaPreview();
  }
  createLineGroup() {
    this.createInProgress = true;
    this.canvas.app.state.processTransaction({
      action: C.ACTIONS.CREATE,
      type: C.TYPES.LINE_GROUP,
      id: window.canvas.app.state.generateId(),
      data: {
        strokeStyle: this.canvas.app.userSettings.get("lineColor"),
        lineWidth: this.canvas.app.userSettings.get("lineWidth"),
        lineDash: this.canvas.app.userSettings.get("lineDash"),
        arrowAnchorIndices: {},
        anchors: [],
        lines: [],
      },
    });
  }
  onMouseUp() {
    if (this.activeLineGroup === null) {
      this.createLineGroup();
    }
    const anchorPoint = this.getAnchorPointAtCoordinates(
      this.currentTargetPoint
    );
    if (anchorPoint) {
      this.activeLineGroup.connectToAnchorPoint(anchorPoint);
    } else {
      this.activeLineGroup.addAnchorPointAndLineSegment({
        type: C.ANCHOR_TYPES.STANDALONE,
        x: this.currentTargetPoint.x,
        y: this.currentTargetPoint.y,
      });
    }
  }
  getAnchorPointAtCoordinates(point) {
    var id, i, anchorPoint;
    const lineGroups = this.canvas.app.state.getAllOfType(C.TYPES.LINE_GROUP);
    for (id in lineGroups) {
      for (i = 0; i < lineGroups[id].data.anchors.length; i++) {
        anchorPoint = lineTools.toAnchorPoint(lineGroups[id].data.anchors[i]);
        if (anchorPoint && point.equals(anchorPoint)) {
          return anchorPoint;
        }
      }
    }
    const components = this.canvas.app.objects.getAllOfType(C.TYPES.COMPONENT);
    for (id in components) {
      for (i = 0; i < components[id].anchorPoints.anchors.length; i++) {
        anchorPoint = lineTools.toAnchorPoint(
          components[id].anchorPoints.anchors[i]
        );
        if (point.equals(anchorPoint)) {
          return {
            type: anchorPoint.type,
            index: anchorPoint.index,
            id: anchorPoint.id,
          };
        }
      }
    }
    return null;
  }
  onMouseMove(point) {
    this.currentTargetPoint = point;
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  deleteAnchorPointsForObjectId(objectId) {
    const lineGroups = this.canvas.app.state.getAllOfType(C.TYPES.LINE_GROUP);
    var lineGroup, id, i;
    for (id in lineGroups) {
      for (i = 0; i < lineGroups[id].data.anchors.length; i++) {
        if (lineGroups[id].data.anchors[i] === null) {
          continue;
        }
        if (
          lineGroups[id].data.anchors[i].type === C.ANCHOR_TYPES.OBJECT &&
          lineGroups[id].data.anchors[i].id === objectId
        ) {
          lineGroup = this.canvas.app.objects.getById(id);
          if (lineGroup) {
            lineGroup.subparts.setSelected(i, C.SUB_PART_TYPES.ANCHOR_POINT);
            lineGroup.subparts.deleteSelectedSubPart(true);
          }
        }
      }
    }
  }
  onLineGroupCreated(lineGroupState) {
    const newLineGroup = new LineGroup(lineGroupState.id, this.canvas);
    this.canvas.app.objects.add(newLineGroup);
    if (this.createInProgress) {
      this.activeLineGroup = newLineGroup;
      this.createInProgress = false;
    }
    this.drawAll();
  }
  onLineGroupUpdated(transaction) {
    const lineGroup = this.canvas.app.objects.getById(transaction.id);
    if (lineGroup) {
      lineGroup.subparts.reconcile();
    }
    this.drawAll();
  }
  drawAll() {
    this.canvas.interactionPlane.plane.scheduleRender();
    this.canvas.pixelPlane.plane.scheduleRender();
  }
  onLineGroupDeleted(transaction) {
    if (this.activeLineGroup && this.activeLineGroup.id === transaction.id) {
      this.activeLineGroup = null;
    }
    this.canvas.app.objects.removeById(transaction.id);
    this.drawAll();
  }
  getLineObjectForPoint(point) {
    var minDistance = Infinity,
      closestLineGroup = null,
      distance,
      id;
    const lineObjects = tools.mergeMaps(
      this.canvas.app.objects.getAllOfType(C.TYPES.LINE_GROUP),
      this.canvas.app.objects.getAllOfType(C.TYPES.AREA)
    );
    for (id in lineObjects) {
      distance =
        lineObjects[id].lineFinder.getClosestLineSegment(point).distance;
      if (distance < config.lineSelectionProximity && distance < minDistance) {
        minDistance = distance;
        closestLineGroup = lineObjects[id];
      }
    }
    return closestLineGroup;
  }
  computeBoundingBoxes() {
    return [];
  }
}
