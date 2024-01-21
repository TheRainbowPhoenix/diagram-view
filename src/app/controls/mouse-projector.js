import config from "../config";
import C from "../constants";
import Point from "../geometry/point";
import Rectangle from "../geometry/rectangle";
import EventEmitter from "../tools/event-emitter";
import * as THREE from "three";

const D = {};
D[C.EVENTS.CELL_CHANGED] = {
  factor: 1,
  offset: 0,
};
D[C.EVENTS.HALF_CELL_INTERSECTION_CHANGED] = {
  factor: 2,
  offset: 2.5,
};
D[C.EVENTS.HALF_CELL_CHANGED] = {
  factor: 2,
  offset: 0,
};
D[C.EVENTS.QUARTER_CELL_CHANGED] = {
  factor: 4,
  offset: 0,
};
D[C.EVENTS.QUARTER_CELL_INTERSECTION_CHANGED] = {
  factor: 4,
  offset: 1.25,
};
D[C.EVENTS.EIGHTS_CELL_CHANGED] = {
  factor: 8,
  offset: 0,
};

export default class MouseProjector extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.raycaster = new THREE.Raycaster();
    this.calcPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    this.mousePosition = new THREE.Vector2();
    this.rawPos = new Point();
    this.halfCellPos = new Point();
    this.halfCellIntersectionPos = new Point();
    this.quarterCellPos = new Point();
    this.cellPos = new Point();
    this.eightsCellPos = new Point();
    this.quarterCellIntersectionPos = new Point();
    this.lastRawX = null;
    this.lastRawY = null;
    this.lastEvent = null;
    this.stopMouseTracking = false;
    window.addEventListener(
      "mousemove",
      this.processMousePosition.bind(this),
      false
    );
    window.addEventListener("touchmove", this.onTouchMove.bind(this), false);
  }
  get2DCoordinatesForObject(obj) {
    const vector = new THREE.Vector3();
    const widthHalf = 0.5 * this.canvas.renderer.context.canvas.width;
    const heightHalf = 0.5 * this.canvas.renderer.context.canvas.height;
    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(this.canvas.camera.getThreeObject());
    vector.x = vector.x * widthHalf + widthHalf;
    vector.y = -(vector.y * heightHalf) + heightHalf;
    return new Point(vector.x, vector.y);
  }
  getIntersection(event, camera) {
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(
      this.mousePosition,
      camera || this.canvas.camera.getThreeObject()
    );
    return this.raycaster.ray.intersectPlane(
      this.calcPlane,
      new THREE.Vector3()
    );
  }
  onTouchMove(e) {
    if (e.targetTouches.length === 1) {
      this.processMousePosition(e.targetTouches[0]);
    }
  }
  processMousePosition(event) {
    if (this.stopMouseTracking === true) {
      return;
    }
    const intersection = this.getIntersection(event);
    this.lastEvent = event;
    this.lastRawX = intersection.x / config.gridCellSize;
    this.lastRawY = intersection.z / config.gridCellSize;
    this.updatePosition(
      C.EVENTS.CELL_CHANGED,
      this.halfCellIntersectionPos,
      intersection
    );
    this.updatePosition(
      C.EVENTS.HALF_CELL_INTERSECTION_CHANGED,
      this.halfCellIntersectionPos,
      intersection
    );
    this.updatePosition(
      C.EVENTS.HALF_CELL_CHANGED,
      this.halfCellPos,
      intersection
    );
    this.updatePosition(
      C.EVENTS.QUARTER_CELL_CHANGED,
      this.quarterCellPos,
      intersection
    );
    this.updatePosition(
      C.EVENTS.QUARTER_CELL_INTERSECTION_CHANGED,
      this.quarterCellIntersectionPos,
      intersection
    );
    this.updatePosition(
      C.EVENTS.EIGHTS_CELL_CHANGED,
      this.eightsCellPos,
      intersection
    );
    if (this.hasListeners(C.EVENTS.RAW_POSITION_CHANGED)) {
      const x = intersection.x / config.gridCellSize;
      const y = intersection.z / config.gridCellSize;
      if (this.rawPos.x !== x || this.rawPos.y !== y) {
        this.rawPos.set(x, y);
        this.emit(C.EVENTS.RAW_POSITION_CHANGED, this.rawPos);
      }
    }
  }
  updatePosition(eventName, position, intersection) {
    if (!this.hasListeners(eventName)) {
      return;
    }
    const factor = D[eventName].factor;
    const offset = D[eventName].offset;
    const x =
      Math.floor(((intersection.x + offset) / config.gridCellSize) * factor) /
      factor;
    const y =
      Math.floor(((intersection.z + offset) / config.gridCellSize) * factor) /
      factor;
    if (position.x !== x || position.y !== y) {
      position.set(x, y);
      this.emit(eventName, position);
    }
  }
  getViewPortRectangle() {
    const v2 = new THREE.Vector2();
    const f = (x, y) => {
      const v3 = new THREE.Vector3();
      v2.x = x;
      v2.y = y;
      this.raycaster.setFromCamera(v2, this.canvas.camera.getThreeObject());
      this.raycaster.ray.intersectPlane(this.calcPlane, v3);
      return v3;
    };
    const p1 = f(-1, -1);
    const p2 = f(1, 1);
    return new Rectangle(p1.x, p1.z, p2.x, p2.z);
  }
  getPlaneCoordinatesForMouseEvent(event, mouseMoveMode) {
    const intersection = this.getIntersection(event);
    if (mouseMoveMode === C.EVENTS.RAW_POSITION_CHANGED) {
      return new Point(
        intersection.x / config.gridCellSize,
        intersection.z / config.gridCellSize
      );
    } else {
      return new Point(
        Math.floor(
          ((intersection.x + D[mouseMoveMode].offset) / config.gridCellSize) *
            D[mouseMoveMode].factor
        ) / D[mouseMoveMode].factor,
        Math.floor(
          ((intersection.z + D[mouseMoveMode].offset) / config.gridCellSize) *
            D[mouseMoveMode].factor
        ) / D[mouseMoveMode].factor
      );
    }
  }
}
