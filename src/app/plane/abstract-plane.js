import config from "../config";
import C from "../constants";
import Point from "../geometry/point";
import EventEmitter from "../tools/event-emitter";
import * as THREE from "three";
import DrawStep from "../state/draw-step";

// DrawStep
export default class AbstractPlane extends EventEmitter {
  constructor(canvas, yCoord) {
    super();
    this.canvas = canvas;
    this.htmlCanvasElement = document.createElement("canvas");
    this.htmlCanvasElement.width = config.textureCanvasWidth;
    this.htmlCanvasElement.height = config.textureCanvasHeight;
    this.ctx = this.htmlCanvasElement.getContext("2d");
    this.ctx.textBaseline = "middle";
    this.ctx.miterLimit = 2;
    this.texture = new THREE.CanvasTexture(this.htmlCanvasElement);
    this.texture.anisotropy =
      this.canvas.renderer.capabilities.getMaxAnisotropy();
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = yCoord;
    this.canvas.scene.add(this.mesh);
    this.raycaster = new THREE.Raycaster();
    this.calcPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    this.side = null;
    this.canvas.camera.on("change", this.adjustToCamera, this);
    this.steps = [];
    this.redrawing = false;
    this.renderScheduled = false;
    this.toCanvasWidthFn = this.toCanvasWidth.bind(this);
    this.intersectionPoint = new THREE.Vector3();
    requestAnimationFrame(this.adjustToCamera.bind(this));
  }
  scheduleRender() {
    this.renderScheduled = true;
  }
  render() {
    this.clear();
    this.emit("render");
    this.texture.needsUpdate = true;
    this.renderScheduled = false;
  }
  enableTextBlending() {
    this.material.blending = THREE.CustomBlending;
    this.material.blendSrc = THREE.OneFactor;
    this.material.blendDst = THREE.OneMinusSrcAlphaFactor;
  }
  adjustToCamera() {
    const a = this.project(-1, -1);
    const b = this.project(1, 1);
    const center = this.project(0, 0);
    this.side = Math.min(
      config.gridWidth,
      Math.max(Math.abs(b.x - a.x), Math.abs(a.z - b.z))
    );
    this.mesh.scale.setX(this.side);
    this.mesh.scale.setY(this.side);
    this.mesh.position.setX(center.x);
    this.mesh.position.setZ(center.z);
    this.redraw();
  }
  redraw() {
    if (this.steps.length === 0) {
      return;
    }
    this.redrawing = true;
    this.ctx.clearRect(
      0,
      0,
      config.textureCanvasWidth,
      config.textureCanvasHeight
    );
    for (var i = 0; i < this.steps.length; i++) {
      this[this.steps[i].name].apply(this, this.steps[i].args);
    }
    this.redrawing = false;
    this.texture.needsUpdate = true;
  }
  project(screenX, screenY) {
    this.raycaster.setFromCamera(
      new THREE.Vector2(screenX, screenY),
      this.canvas.camera.getThreeObject()
    );
    return this.raycaster.ray.intersectPlane(
      this.calcPlane,
      new THREE.Vector3()
    );
  }
  setFont(fontSize, fontFamily, fontStyle) {
    var fontStyleString = "";
    if (fontStyle) {
      if (fontStyle.italic && fontStyle.bold) {
        fontStyleString = "italic bold ";
      } else if (fontStyle.italic) {
        fontStyleString = "italic ";
      } else if (fontStyle.bold) {
        fontStyleString = "bold ";
      }
    }
    this.ctx.font =
      fontStyleString + this.toCanvasWidth(fontSize) + "px " + fontFamily;
    this.addStep("setFont", [fontSize, fontFamily, fontStyle]);
  }
  setTextAlign(textAlign) {
    this.ctx.textAlign = textAlign;
    this.addStep("setTextAlign", textAlign);
  }
  setLineWidth(lineWidth) {
    this.ctx.lineWidth = this.toCanvasHeight(lineWidth);
    this.addStep("setLineWidth", lineWidth);
  }
  setShadowLevel(shadowLevel) {
    this.ctx.shadowColor = "#00000044";
    this.ctx.shadowOffsetY = 5 * shadowLevel;
    this.ctx.shadowOffsetX = 5 * shadowLevel;
    this.ctx.shadowBlur = 5 * shadowLevel;
    this.addStep("setShadowLevel", shadowLevel);
  }
  setLineCap(lineCap) {
    this.ctx.lineCap = lineCap;
  }
  setLineJoin(lineJoin) {
    this.ctx.lineJoin = lineJoin;
  }
  setLineDash(lineDash) {
    this.ctx.setLineDash(lineDash.map(this.toCanvasWidthFn));
    this.addStep("setLineDash", [lineDash]);
  }
  setStrokeStyle(strokeStyle) {
    this.ctx.strokeStyle = strokeStyle;
    this.addStep("setStrokeStyle", strokeStyle);
  }
  setFillStyle(fillStyle) {
    this.ctx.fillStyle = fillStyle;
    this.addStep("setFillStyle", fillStyle);
  }
  beginPath() {
    this.ctx.beginPath();
    this.addStep("beginPath");
  }
  closePath() {
    this.ctx.closePath();
    this.addStep("closePath");
  }
  stroke() {
    this.ctx.stroke();
    this.addStep("stroke");
  }
  fill() {
    this.ctx.fill();
    this.addStep("fill");
  }
  moveTo(point) {
    this.ctx.moveTo(this.toCanvasX(point.x), this.toCanvasY(point.y));
    this.addStep("moveTo", point);
  }
  lineTo(point) {
    this.ctx.lineTo(this.toCanvasX(point.x), this.toCanvasY(point.y));
    this.addStep("lineTo", point);
  }
  clipRectangle(rectangle) {
    this.ctx.rect(
      this.toCanvasX(rectangle.x1),
      this.toCanvasY(rectangle.y1),
      this.toCanvasWidth(rectangle.width),
      this.toCanvasHeight(rectangle.height)
    );
    this.ctx.clip();
    this.addStep("clipRectangle", rectangle);
  }
  drawImage(image, dX, dY, dWidth, dHeight, rotation) {
    if (!image || image.naturalWidth === 0) {
      return;
    }
    if (rotation) {
      this.ctx.translate(
        this.toCanvasX(dX + dWidth / 2),
        this.toCanvasY(dY + dHeight / 2)
      );
      this.ctx.rotate(rotation);
      this.ctx.drawImage(
        image,
        this.toCanvasWidth(-(dWidth / 2)),
        this.toCanvasHeight(-(dHeight / 2)),
        this.toCanvasWidth(dWidth),
        this.toCanvasHeight(dHeight)
      );
      this.ctx.resetTransform();
    } else {
      this.ctx.drawImage(
        image,
        this.toCanvasX(dX),
        this.toCanvasY(dY),
        this.toCanvasWidth(dWidth),
        this.toCanvasHeight(dHeight)
      );
    }
    this.addStep("drawImage", [image, dX, dY, dWidth, dHeight, rotation]);
  }
  drawCircle(center, r, stroke, fill) {
    this.ctx.beginPath();
    this.ctx.arc(
      this.toCanvasX(center.x),
      this.toCanvasY(center.y),
      this.toCanvasWidth(r),
      0,
      2 * Math.PI,
      false
    );
    if (stroke) {
      this.ctx.stroke();
    }
    if (fill) {
      this.ctx.fill();
    }
    this.addStep("drawCircle", [center, r, stroke, fill]);
  }
  fillText(text, position, rotation, pivotPoint) {
    if (rotation) {
      if (pivotPoint) {
        this.ctx.translate(
          this.toCanvasX(pivotPoint.x),
          this.toCanvasY(pivotPoint.y)
        );
      } else {
        this.ctx.translate(
          this.toCanvasX(position.x),
          this.toCanvasY(position.y)
        );
      }
      this.ctx.rotate(rotation);
      this.ctx.fillText(text, 0, 0);
      this.ctx.resetTransform();
    } else {
      this.ctx.fillText(
        text,
        this.toCanvasX(position.x) + 2,
        this.toCanvasY(position.y)
      );
    }
    this.addStep("fillText", [text, position, rotation, pivotPoint]);
  }
  strokeText(text, position, rotation) {
    if (rotation) {
      this.ctx.translate(
        this.toCanvasX(position.x) + 2,
        this.toCanvasY(position.y)
      );
      this.ctx.rotate(rotation);
      this.ctx.strokeText(text, 0, 0);
      this.ctx.resetTransform();
    } else {
      this.ctx.strokeText(
        text,
        this.toCanvasX(position.x) + 2,
        this.toCanvasY(position.y)
      );
    }
    this.addStep("strokeText", [text, position, rotation]);
  }
  measureText(text) {
    return this.ctx.measureText(text).width / this.toCanvasWidth(1);
  }
  toCanvasX(x) {
    const positionOnCanvas =
      ((this.side / 2 + x * config.gridCellSize) / this.side) *
      config.textureCanvasWidth;
    const positionOffset =
      this.mesh.position.x * (config.textureCanvasWidth / this.side);
    return positionOnCanvas - positionOffset;
  }
  toCanvasY(y) {
    const positionOnCanvas =
      ((this.side / 2 + y * config.gridCellSize) / this.side) *
      config.textureCanvasHeight;
    const positionOffset =
      this.mesh.position.z * (config.textureCanvasHeight / this.side);
    return positionOnCanvas - positionOffset;
  }
  toCanvasWidth(width) {
    return (
      ((width * config.gridCellSize) / this.side) * config.textureCanvasWidth
    );
  }
  toCanvasHeight(height) {
    return (
      ((height * config.gridCellSize) / this.side) * config.textureCanvasHeight
    );
  }
  fillRect(rectangle) {
    this.ctx.fillRect(
      this.toCanvasX(rectangle.x1),
      this.toCanvasY(rectangle.y1),
      this.toCanvasWidth(rectangle.width),
      this.toCanvasHeight(rectangle.height)
    );
    this.addStep("fillRect", rectangle);
  }
  strokeRect(rectangle) {
    this.ctx.strokeRect(
      this.toCanvasX(rectangle.x1),
      this.toCanvasY(rectangle.y1),
      this.toCanvasWidth(rectangle.width),
      this.toCanvasHeight(rectangle.height)
    );
    this.addStep("strokeRect", rectangle);
  }
  clear() {
    this.ctx.clearRect(
      0,
      0,
      config.textureCanvasWidth,
      config.textureCanvasHeight
    );
    this.steps = [];
    this.texture.needsUpdate = true;
  }
  addStep(name, args) {
    if (this.redrawing === false) {
      this.steps.push(new DrawStep(name, args));
    }
  }
}
