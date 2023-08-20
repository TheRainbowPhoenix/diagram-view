import * as THREE from "three";
import config from "../config";

import C from "../constants";
import Rectangle from "../geometry/rectangle";
import * as objectData from "./object-data";

export default class BaseObject {
  constructor(config, canvas, state) {
    this.config = config;
    this.canvas = canvas;
    this.id = state.id;
    this.isGeneric = this.config.id.split(".")[0] === C.GENERIC;
    this.type = C.TYPES.COMPONENT;
    this.isSelected = false;
    this.isSelectable = true;
    this.isHoverable = true;
    this.isHovered = false;
    this.metricsPlane = null;
    this.boundingBox = new Rectangle();
    this.model = objectData.getModel(config.model);
    this.geometry = loader.parse(this.model).geometry;
    this.backgroundMaterial = new THREE.MeshPhongMaterial({
      color: parseInt(config.backgroundColor, 16),
    });
    this.primaryColorMaterial = new THREE.MeshBasicMaterial({
      color: parseInt(config.primaryColor, 16),
    });
    if (this.model.doubleSided) {
      this.backgroundMaterial.side = THREE.DoubleSide;
      this.primaryColorMaterial.side = THREE.DoubleSide;
    }
    const materials = [this.backgroundMaterial, this.primaryColorMaterial];
    if (config.secondaryColor) {
      this.secondaryColorMaterial = new THREE.MeshPhongMaterial({
        color: parseInt(config.secondaryColor, 16),
      });
      materials.push(this.secondaryColorMaterial);
    }
    this.paintFaces();
    this.mesh = new THREE.Mesh(this.geometry, materials);
    this.mesh.material.polygonOffset = true;
    this.mesh.material.polygonOffsetFactor = 1;
    this.mesh.material.polygonOffsetUnits = 1;
    this.edges = new THREE.EdgesGeometry(this.geometry);
    this.edgeLines = new THREE.LineSegments(
      this.edges,
      new THREE.LineBasicMaterial({
        color: 6710886,
        linewidth: 1,
      })
    );
    this.scaleToGrid(this.mesh);
    this.scaleToGrid(this.edgeLines);
    this.group = new THREE.Group();
    this.group.add(this.mesh);
    this.group.add(this.edgeLines);
    if (!this.model.disableImagePlane) {
      this.createLogoPlane(state.data);
    }
    this.mesh.arcObject = this;
    this.group.arcObject = this;
    this.anchorPoints = new ObjectAnchorPoints(this.canvas, this);
    if (state.data && state.data.position) {
      this.applyState();
    } else {
      this.setPositionOnGrid({
        x: 2e4,
        y: 2e4,
      });
    }
    this.canvas.app.state.on(this.id + "-update", this.applyState, this);
    this.canvas.layerManager.on("change", this.applyLayerSettings, this);
    this.applyLayerSettings();
  }
  delete() {
    this.canvas.linePlane.deleteAnchorPointsForObjectId(this.id);
    this.canvas.app.state.processTransaction({
      action: C.ACTIONS.DELETE,
      type: C.TYPES.COMPONENT,
      id: this.id,
    });
  }
  getThreeObject() {
    return this.group;
  }
  applyLayerSettings() {
    const layer = this.canvas.layerManager.getLayerForObject(this.id);
    this.setVisible(layer.visible);
  }
  setVisible(isVisible) {
    this.mesh.visible = isVisible;
    this.edgeLines.visible = isVisible;
    if (this.logoPlane) {
      this.logoPlane.mesh.visible = isVisible;
    }
  }
  createLogoPlane(data) {
    var logoPath;
    if (this.isGeneric) {
      logoPath = appConfig.logoFolder + "blank.png";
    } else {
      logoPath = appConfig.logoFolder + this.config.logoTexture;
    }
    this.logoPlane = new ImagePlane(logoPath, this.canvas, this.model);
    this.logoPlane.setPosition(
      this.model.imagePlanePosition,
      this.config.logoTexturePositionOffset || {}
    );
    this.logoPlane.setRotation(this.model.imagePlaneRotation || {});
    this.logoPlane.setScale(this.model.imagePlaneScale);
    this.group.add(this.logoPlane.getThreeObject());
  }
  setOpacity(opacity) {
    this.mesh.material.forEach((material) => {
      if (material.opacity === opacity) {
        return;
      }
      material.opacity = opacity;
      material.transparent = opacity !== 1;
      material.needsUpdate = true;
    });
    if (this.logoPlane && this.logoPlane.mesh.material.opacity !== opacity) {
      this.logoPlane.mesh.material.opacity = opacity;
      this.logoPlane.mesh.material.needsUpdate = true;
    }
    if (this.edgeLines.material.opacity !== opacity) {
      this.edgeLines.material.opacity = opacity;
      this.edgeLines.material.transparent = opacity !== 1;
      this.edgeLines.material.needsUpdate = true;
    }
  }
  paintFaces() {
    var i;
    for (i = 0; i < this.geometry.faces.length; i++) {
      this.geometry.faces[i].materialIndex = 0;
    }
    for (i = 0; i < this.model.primaryColorFaces.length; i++) {
      this.geometry.faces[this.model.primaryColorFaces[i]].materialIndex = 1;
    }
    if (this.model.secondaryColorFaces && this.secondaryColorMaterial) {
      for (i = 0; i < this.model.secondaryColorFaces.length; i++) {
        this.geometry.faces[
          this.model.secondaryColorFaces[i]
        ].materialIndex = 2;
      }
    }
  }
  computeBoundingBox() {
    const state = this.canvas.app.state.getStateForId(this.id);
    const pos = state.position;
    const size = this.model.sizeOnGrid;
    const rotation = Math.round(state.rotation);
    var x1, y1, x2, y2;
    if (rotation === 0) {
      x1 = pos.x;
      y1 = pos.y;
      x2 = pos.x + size.width;
      y2 = pos.y + size.height;
    } else if (rotation === 2) {
      x1 = pos.x;
      y1 = pos.y;
      x2 = pos.x + size.height;
      y2 = pos.y + size.width;
    } else if (rotation === 3) {
      x1 = pos.x + 1;
      y1 = pos.y + 1;
      x2 = pos.x - size.width + 1;
      y2 = pos.y - size.height + 1;
    } else if (rotation === 5) {
      x1 = pos.x + 1;
      y1 = pos.y + 1;
      x2 = pos.x - size.height + 1;
      y2 = pos.y - size.width + 1;
    }
    this.boundingBox.set(x1, y1, x2, y2);
    return this.boundingBox;
  }
  applyState() {
    const state = this.canvas.app.state.getStateForId(this.id);
    this.setPositionOnGrid(state.position);
    this.group.rotation.y = state.rotation;
    this.anchorPoints.refresh();
    if (
      state.backgroundColor &&
      this.backgroundMaterial.color.getHexString() !== state.backgroundColor
    ) {
      this.backgroundMaterial.color.set(state.backgroundColor);
      this.backgroundMaterial.needsUpdate = true;
    }
    if (
      state.primaryColor &&
      this.primaryColorMaterial.color.getHexString() !== state.primaryColor
    ) {
      this.primaryColorMaterial.color.set(state.primaryColor);
      this.primaryColorMaterial.needsUpdate = true;
    }
    if (state.imagePath && this.logoPlane) {
      this.logoPlane.setImagePath(state.imagePath);
    } else if (state.icon && this.logoPlane) {
      this.logoPlane.setIcon(state.icon, state.iconColor);
    }
    if (state.showMetrics) {
      if (!this.metricsPlane) {
        this.metricsPlane = new MetricsPlane(this.canvas, state.metricValue);
      }
      this.group.add(this.metricsPlane.getThreeObject());
    } else if (this.metricsPlane) {
      this.group.remove(this.metricsPlane.getThreeObject());
    }
    if (state.showMetrics) {
      this.metricsPlane.setValue(state.metricValue);
    }
    if (state.showMetaData) {
      this.canvas.pixelPlane.plane.scheduleRender();
    }
    if (!isNaN(state.opacity)) {
      this.setOpacity(state.opacity);
    }
    this.canvas.pixelPlane.plane.scheduleRender();
    this.canvas.interactionPlane.plane.scheduleRender();
  }
  showContextOverlay() {
    this.canvas.app.$refs.contextOverlay.showComponentInfo(this.mesh, this.id);
  }
  showSelected() {
    this.isSelected = true;
    this.isHoverable = false;
    this.isHovered = false;
    if (this.canvas.app.$refs.viewControls.isDashboardMode) {
      this.showContextOverlay();
    }
  }
  hideSelected() {
    this.isHoverable = !this.isLocked;
    this.isSelected = false;
    this.canvas.app.$refs.contextOverlay.hide();
  }
  showHover() {
    this.isHovered = true;
  }
  hideHover() {
    this.isHovered = false;
  }
  setPositionOnGrid(point) {
    const f = config.gridCellSize / 2;
    this.group.position.set(
      point.x * config.gridCellSize + f,
      0.1,
      point.y * config.gridCellSize + f
    );
  }
  scaleToGrid(mesh) {
    this.geometry.computeBoundingBox();
    const currentWidth =
      this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x;
    const currentDepth =
      this.geometry.boundingBox.max.z - this.geometry.boundingBox.min.z;
    const currentSize = Math.max(currentWidth, currentDepth);
    const scaleFactor =
      (config.gridCellSize / currentSize) *
      Math.max(this.model.sizeOnGrid.width, this.model.sizeOnGrid.height);
    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    if (this.model.meshOffset) {
      mesh.position.set(
        this.model.meshOffset.x,
        this.model.meshOffset.y,
        this.model.meshOffset.z
      );
    }
  }
  destroy() {
    this.canvas.scene.remove(this.group);
    this.geometry.dispose();
    this.backgroundMaterial.dispose();
    this.primaryColorMaterial.dispose();
    if (this.logoPlane) {
      this.logoPlane.destroy();
      this.logoPlane = null;
    }
    this.canvas.app.state.off(this.id + "-update", this.applyState, this);
    this.canvas.layerManager.off("change", this.applyLayerSettings, this);
    this.config = null;
    this.canvas = null;
    this.geometry = null;
    this.backgroundMaterial = null;
    this.model = null;
    this.mesh = null;
    this.group = null;
  }
}
