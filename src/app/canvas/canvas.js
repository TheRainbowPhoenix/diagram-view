// canvas.scene

import * as THREE from "three";

import Grid from "../plane/grid";
import Camera from "../camera/camera";

import config from "../config";
import MouseControls from "../controls/mouse-controls";
import PixelPlane from "../pixel/pixel-plane";
import InteractionPlane from "../plane/interaction-plane";
import KeyboardControls from "../controls/keyboard-controls";
import SelectionManager from "../controls/selection-manager";
import LinePlane from "../line/line-plane";
import MouseProjector from "../controls/mouse-projector";
import ContinuousPan from "../controls/continuous-pan";
import Animation from "./animation";

export class Canvas {
  /**
   *
   * @param {HTMLElement} element
   * @param {import("../types").App} app
   */
  constructor(element, app) {
    this.element = element;
    this.app = app;
    this.stopRender = false;
    this.renderer = this.createRenderer();
    this.element.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new Camera(this);
    this.grid = new Grid(this);
    this.mouseControls = new MouseControls(this);
    this.mouseProjector = new MouseProjector(this);
    this.continuousPan = new ContinuousPan(this);
    this.keyboardControls = new KeyboardControls(this);
    this.interactionPlane = new InteractionPlane(this);
    // TODO ...
    this.pixelPlane = new PixelPlane(this);
    this.linePlane = new LinePlane(this);
    // TODO ...
    this.selectionManager = new SelectionManager(this);
    // TODO ...
    this.animations = [];
    // TODO ...
    this.renderFn = this.render.bind(this);
    this.render(); // TODO: don't lock it in loop !!
    window.canvas = this;
    window.addEventListener("resize", this.onResize.bind(this), false);
  }

  animate(fn, frames) {
    const animation = new Animation(fn, frames);
    this.animations.push(animation);
    return animation;
  }

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    renderer.setClearColor(16777215, 1);
    const parentBounds = this.element.getBoundingClientRect();
    const sizeRatio = 16 / 9;
    renderer.setSize(parentBounds.width, parentBounds.height); // parentBounds.width / sizeRatio
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(
      window.devicePixelRatio ||
        window.screen.deviceXDPI / window.screen.logicalXDPI
    );
    return renderer;
  }

  onResize() {
    const parentBounds = this.element.getBoundingClientRect();

    this.camera.resize(parentBounds.width / parentBounds.height);
    this.renderer.setSize(parentBounds.width, parentBounds.height);
    this.interactionPlane.plane.scheduleRender();
    this.pixelPlane.plane.scheduleRender();
  }

  createPointLight() {
    const light = new THREE.PointLight(16777215, 0.8);
    light.position.set(0, 50, 50);
    return light;
  }

  tick() {
    var anim, i, t, f;
    for (i = 0; i < this.animations.length; i++) {
      anim = this.animations[i];
      anim.currentFrame++;
      t = anim.currentFrame / anim.totalFrames;
      f = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      if (anim.fn) {
        anim.fn(f);
      }
      if (anim.isComplete()) {
        anim.destroy();
        this.animations.splice(i, 1);
      }
    }
    // TODO
    // if (this.pixelPlane.plane.renderScheduled === true) {
    //   this.pixelPlane.plane.render();
    // }
    // if (this.interactionPlane.plane.renderScheduled === true) {
    //   this.interactionPlane.plane.render();
    // }
    if (this.stopRender !== true) {
      this.renderer.render(this.scene, this.camera.getThreeObject());
    }
  }

  render() {
    this.tick();
    requestAnimationFrame(this.renderFn);
  }

  setCanvasElementDimensions(plane, width, height) {
    const lineCap = plane.ctx.lineCap;
    const lineJoin = plane.ctx.lineJoin;
    const textAlign = plane.ctx.textAlign;
    const textBaseline = plane.ctx.textBaseline;
    plane.htmlCanvasElement.width = width;
    plane.htmlCanvasElement.height = height;
    plane.ctx.lineCap = lineCap;
    plane.ctx.lineJoin = lineJoin;
    plane.ctx.textAlign = textAlign;
    plane.ctx.textBaseline = textBaseline;
  }
}
