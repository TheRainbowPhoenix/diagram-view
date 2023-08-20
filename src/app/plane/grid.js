import * as THREE from "three";
import STYLES from "../common/styles";
import config from "../config";

const S = config.pixelPerUnit;

export default class Grid {
  constructor(canvas) {
    this.canvas = canvas;
    this.htmlCanvasElement = document.createElement("canvas");
    this.htmlCanvasElement.width = S;
    this.htmlCanvasElement.height = S;
    this.ctx = this.htmlCanvasElement.getContext("2d");
    this.texture = new THREE.CanvasTexture(this.htmlCanvasElement);
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;
    this.texture.anisotropy =
      this.canvas.renderer.capabilities.getMaxAnisotropy();
    this.texture.repeat.set(
      Math.floor(config.gridWidth / 10),
      Math.floor(config.gridHeight / 10)
    );
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
    });
    this.geometry = new THREE.PlaneGeometry( // PlaneBufferGeometry
      config.gridWidth,
      config.gridHeight,
      1,
      1
    );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.order = "YXZ";
    this.mesh.rotation.y = -Math.PI / 2;
    this.mesh.rotation.x = -Math.PI / 2;
    this.canvas.scene.add(this.mesh);
    this.updateTexture();
  }
  updateTexture() {
    this.ctx.fillStyle = STYLES.grid.background;
    this.ctx.strokeStyle = STYLES.grid.secondaryLineColor;
    this.ctx.fillRect(0, 0, S, S);
    this.ctx.beginPath();
    this.ctx.moveTo(0, S / 2);
    this.ctx.lineTo(S, S / 2);
    this.ctx.moveTo(S / 2, 0);
    this.ctx.lineTo(S / 2, S);
    this.ctx.stroke();
    this.ctx.strokeStyle = STYLES.grid.primaryLineColor;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 1);
    this.ctx.lineTo(S, 1);
    this.ctx.moveTo(S - 1, 0);
    this.ctx.lineTo(S - 1, S);
    this.ctx.stroke();
    this.texture.needsUpdate = true;
  }
}
