import * as THREE from "three";
import C from "../constants";
import Point from "../geometry/point";

export default class ObjectFinder {
  constructor(app) {
    this.app = app;
    this.raycaster = new THREE.Raycaster();
    this.mousePosition = new THREE.Vector2();
    this.boundingBoxes = {};
    this.app.state.on("change", this.computeBoundingBoxes, this);
    this.app.objects.on("change", this.computeBoundingBoxes, this);
  }
  computeBoundingBoxes() {
    this.boundingBoxes =
      this.app.objects.callMethodOnObjects("computeBoundingBox");
  }
  intersectsComponent(rectangle) {
    for (var id in this.boundingBoxes) {
      if (rectangle.isWithin(this.boundingBoxes[id])) {
        return true;
      }
    }
    return false;
  }
  getObjectsWithinRectangle(rectangle) {
    var matchedObjects = [],
      id,
      obj;
    for (id in this.boundingBoxes) {
      if (rectangle.intersects(this.boundingBoxes[id])) {
        obj = this.app.objects.getById(id);
        if (
          obj.type === C.TYPES.LINE_GROUP &&
          !rectangle.isWithin(this.boundingBoxes[id])
        ) {
          if (!obj.lineFinder.intersectsRectangle(rectangle)) {
            continue;
          }
        }
        matchedObjects.push(obj);
      }
    }
    return matchedObjects;
  }
  getObjectsForMouseEvent(event) {
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(
      this.mousePosition,
      this.app.canvas.camera.getThreeObject()
    );
    const intersections = this.raycaster.intersectObjects(
      this.app.canvas.scene.children,
      true
    );
    const matchingObjects = [];
    var lineObject, pixelObject;
    for (var i = 0; i < intersections.length; i++) {
      if (
        intersections[i].object.arcObject &&
        matchingObjects.indexOf(intersections[i].object.arcObject) === -1
      ) {
        matchingObjects.push(intersections[i].object.arcObject);
      } else if (
        intersections[i].object === this.app.canvas.pixelPlane.plane.mesh
      ) {
        matchingObjects.planeIntersectionPoint = Point.fromThreePoint(
          intersections[i].point
        );
        pixelObject = this.app.canvas.pixelPlane.getPixelObjectForPoint(
          Point.fromThreePoint(intersections[i].point)
        );
        if (pixelObject) {
          matchingObjects.push(pixelObject);
        }
        lineObject = this.app.canvas.linePlane.getLineObjectForPoint(
          matchingObjects.planeIntersectionPoint
        );
        if (lineObject) {
          matchingObjects.push(lineObject);
        }
      }
    }
    return matchingObjects;
  }
}
