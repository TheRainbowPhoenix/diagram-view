import * as THREE from "three";
import config from "../config";
import EventEmitter from "../tools/event-emitter";
import CameraPersistence from "./camera-persistence";
import * as tools from "../tools/tools";
import Rectangle from "../geometry/rectangle";

const D = 450;
const HALF_PI = Math.PI / 2;
const DIRECTIONS = [0, null, 1, 2, null, 3];

export default class Camera extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.persistence = new CameraPersistence(canvas);
    this.camera = this.createCamera();
    this.setPosition(D, D, D);
    this.camera.lookAt(this.canvas.scene.position);
    this.canvas.scene.add(this.camera);
    this.rayCaster = new THREE.Raycaster();
    this.startPos = null;
    this.isTopDown = false;
    this.x = D;
    this.y = D;
    this.animation = null;
    this.center2D = new THREE.Vector2(0, 0);
    this.angle = Math.PI / 4;
    this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    this.mouseStartPos = {};
    this.canvas.app.eventHub.on(
      "init",
      this.persistence.load,
      this.persistence
    );
  }
  getThreeObject() {
    return this.camera;
  }
  centerView() {
    this.camera.lookAt(this.canvas.scene.position);
  }
  rotateLeft() {
    this.rotateAnimation(1);
  }
  rotateRight() {
    this.rotateAnimation(-1);
  }
  getDiagramDimensions() {
    var x1 = Infinity,
      y1 = Infinity,
      x2 = -Infinity,
      y2 = -Infinity;
    Object.values(this.canvas.app.objects.getAll()).forEach((obj) => {
      const boundingBox = obj.computeBoundingBox() || obj.boundingBox;
      x1 = Math.min(boundingBox.x1, x1);
      y1 = Math.min(boundingBox.y1, y1);
      x2 = Math.max(boundingBox.x2, x2);
      y2 = Math.max(boundingBox.y2, y2);
    });
    return new Rectangle(x1, y1, x2, y2);
  }
  getViewCenter() {
    const rayCaster = new THREE.Raycaster();
    const calcPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    const intersection = new THREE.Vector3();
    rayCaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    rayCaster.ray.intersectPlane(calcPlane, intersection);
    return intersection;
  }
  showWholeDiagram() {
    this.setRotation(Math.PI / 4);
    const diagramDimensions = this.getDiagramDimensions();
    const centerX = diagramDimensions.getCenter().x * config.gridCellSize;
    const centerZ = diagramDimensions.getCenter().y * config.gridCellSize;
    const viewCenter = this.getViewCenter();
    this.camera.position.set(
      centerX + (this.camera.position.x - viewCenter.x),
      D,
      centerZ + (this.camera.position.z - viewCenter.z)
    );
    const distanceToCamera = new THREE.Vector3(centerX, 0, centerZ).distanceTo(
      this.camera.position
    );
    const distanceBetweenComponents =
      Math.max(diagramDimensions.width, diagramDimensions.height) *
      config.gridCellSize;
    const zoom =
      (2 * (distanceToCamera * Math.atan(Math.PI / 4))) /
      distanceBetweenComponents;
    this.setZoom(tools.clamp(zoom, config.minZoom, config.maxZoom));
    setTimeout(() => {
      this.emit("change");
    }, 60);
  }
  getDirection() {
    var angle = this.angle;
    if (this.isTopDown) {
      angle += Math.PI / 4;
    }
    var r = angle % (Math.PI * 2);
    if (r < 0) {
      r = Math.PI * 2 + r;
    }
    return DIRECTIONS[Math.floor(r)];
  }
  toggleTopDown() {
    this.completeCurrentAnimation();
    this.isTopDown = !this.isTopDown;
    var startAngle, targetAngle, r;
    const circle = this.projectCircle();
    const p = circle.center;
    r = circle.radius;
    if (this.isTopDown) {
      startAngle = this.angle;
      targetAngle = this.angle + Math.PI / 4;
    } else {
      startAngle = this.angle;
      targetAngle = this.angle - Math.PI / 4;
      r = 636.396103067879;
    }
    this.angle = targetAngle;
    this.animation = this.canvas.animate((f) => {
      f = Math.min(f, 0.9999999999);
      const nF = 1 - f;
      const nR = r * (this.isTopDown ? nF : f);
      const angle = startAngle * nF + targetAngle * f;
      this.camera.position.x = p.x + nR * Math.cos(angle);
      this.camera.position.z = p.z + nR * Math.sin(angle);
      this.camera.lookAt(p);
    }, 40);
    this.animation.completeCallback = () => {
      this.persistence.save();
      this.emit("change");
    };
  }
  completeCurrentAnimation() {
    if (this.animation && this.animation.isComplete() === false) {
      this.animation.complete();
    }
  }
  rotateAnimation(m) {
    this.completeCurrentAnimation();
    var startAngle = this.angle;
    this.animation = this.canvas.animate((f) => {
      this.setRotation(startAngle + HALF_PI * f * m);
    }, config.rotationAnimationDuration);
    this.animation.completeCallback = () => {
      this.persistence.save();
      this.emit("change");
    };
  }
  projectCircle() {
    this.rayCaster.setFromCamera(this.center2D, this.camera);
    const distance = this.rayCaster.ray.distanceToPlane(this.plane);
    const square = Math.pow(distance, 2) - Math.pow(this.camera.position.y, 2);
    return {
      center: this.rayCaster.ray.intersectPlane(
        this.plane,
        new THREE.Vector3()
      ),
      radius: Math.sqrt(Math.max(0, square)),
    };
  }
  setRotation(angle) {
    const c = this.projectCircle();
    this.camera.position.x = c.center.x + c.radius * Math.cos(angle);
    this.camera.position.z = c.center.z + c.radius * Math.sin(angle);
    this.camera.lookAt(c.center);
    this.angle = angle;
  }
  changeZoomBy(delta) {
    const newZoom = tools.clamp(
      this.camera.zoom + delta,
      config.minZoom,
      config.maxZoom
    );
    this.setZoom(newZoom);
  }
  project(point) {
    return this.canvas.mouseProjector.getIntersection(
      {
        clientX: point.x,
        clientY: point.y,
      },
      this.camera // TODO: this.camera.camera
    );
  }
  setToRectangle(rectangle) {
    this.camera.setViewOffset(
      window.innerWidth,
      window.innerHeight,
      rectangle.x1,
      rectangle.y1,
      rectangle.width,
      rectangle.height
    );
  }
  setZoom(zoom) {
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();
    this.persistence.save();
    this.emit("change");
  }
  setPosition(x, y, z) {
    this.camera.position.set(
      tools.clamp(x, -920, 920),
      D,
      tools.clamp(z, -920, 920)
    );
    this.emit("change");
  }
  startPan() {
    this.cameraStartPos = this.camera.position.clone();
    this.originalCamera = this.camera.clone();
    this.originalIntersection = this.canvas.mouseProjector.getIntersection(
      this.canvas.mouseProjector.lastEvent
    );
    document.body.classList.add("pan");
    this.canvas.mouseControls.on("mousemove", this.onMouseMove, this);
  }
  stopPan(keepPanClass) {
    if (!keepPanClass) {
      document.body.classList.remove("pan");
    }
    this.canvas.mouseControls.off("mousemove", this.onMouseMove, this);
    this.persistence.save();
  }
  onMouseMove(event) {
    const intersection = this.canvas.mouseProjector.getIntersection(
      event,
      this.originalCamera
    );
    this.setPosition(
      this.cameraStartPos.x + (this.originalIntersection.x - intersection.x),
      this.cameraStartPos.y,
      this.cameraStartPos.z + (this.originalIntersection.z - intersection.z)
    );
  }
  createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    return new THREE.OrthographicCamera(
      -D * aspect,
      D * aspect,
      D,
      -D,
      10,
      2e3
    );
  }
  resize(aspect) {
    this.camera.left = -D * aspect;
    this.camera.right = D * aspect;
    this.camera.top = D;
    this.camera.bottom = -D;
    this.camera.updateProjectionMatrix();
  }
  createCameraHelper() {
    this.cameraHelper = new THREE.CameraHelper(this.camera);
    this.canvas.scene.add(this.cameraHelper);
  }
}
