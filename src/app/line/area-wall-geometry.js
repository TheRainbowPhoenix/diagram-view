import * as THREE from "three";
// import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

import config from "../config";
import * as calc from "../tools/calc";
import * as lineTools from "./line-tools";

import C from "../constants";

const GATE_WIDTH = 0.4;

export default class AreaWallGeometry {
  constructor(canvas, id) {
    this.canvas = canvas;
    this.id = id;
    this.currentPoints = null;
    this.height = 2;
    this.color = "#CCCCCC";
    this.canvas.app.state.on(
      `${this.id}-${C.ACTIONS.UPDATE}`,
      this.update,
      this
    );
    this.canvas.app.state.on(
      `${C.ACTIONS.CREATE}-${C.TYPES.LINE_GROUP}`,
      this.update,
      this
    );
    this.canvas.app.state.on(
      `${C.ACTIONS.UPDATE}-${C.TYPES.LINE_GROUP}`,
      this.update,
      this
    );
    this.canvas.app.state.on(
      `${C.ACTIONS.DELETE}-${C.TYPES.LINE_GROUP}`,
      this.update,
      this
    );
    this.group = new THREE.Group();
    this.mesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      //   new THREE.Geometry(),
      new THREE.MeshLambertMaterial({
        color: 13421772,
        side: THREE.DoubleSide,
      })
    );
    this.group.add(this.mesh);
    this.edgeLines = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      //   new THREE.Geometry(),
      new THREE.LineBasicMaterial({
        color: 6710886,
        linewidth: 1,
      })
    );
    this.group.add(this.edgeLines);
    this.update();
    this.canvas.scene.add(this.group);
    this.canvas.layerManager.on("change", this.applyLayerSettings, this);
    this.applyLayerSettings();
  }
  update(force) {
    const points = this.computePoints();
    if (!force && this.isUnchanged(points)) {
      return;
    }
    this.currentPoints = points;
    this.createMeshGeometry(points);
    this.createEdgeGeometry();
    this.applyLayerSettings();
  }
  applyLayerSettings() {
    this.group.visible = this.canvas.layerManager.getLayerForObject(
      this.id
    ).visible;
  }
  setHeight(height) {
    if (height === this.height || typeof height !== "number") {
      return;
    }
    this.height = height;
    this.update(true);
  }
  setColor(color) {
    if (this.color === color) {
      return;
    }
    this.color = color;
    this.mesh.material.color.setStyle(color);
  }
  isUnchanged(points) {
    if (this.currentPoints === null) {
      return false;
    }
    if (points.length !== this.currentPoints.length) {
      return false;
    }
    for (var i = 0; i < points.length; i++) {
      if (
        !(
          points[i].x === this.currentPoints[i].x &&
          points[i].y === this.currentPoints[i].y &&
          points[i].isGate === this.currentPoints[i].isGate
        )
      ) {
        return false;
      }
    }
    return true;
  }
  computePoints() {
    const anchors = this.canvas.app.state.getStateForId(this.id, true).anchors;
    const intersectionPoints = this.calculateLineIntersections(anchors);
    var i = 0,
      gateLeft,
      gateRight;
    for (i; i < intersectionPoints.length; i++) {
      gateLeft = this.getOffsetIntersectionPoint(
        intersectionPoints[i],
        intersectionPoints[i].startAnchor
      );
      gateLeft.isGate = true;
      gateRight = this.getOffsetIntersectionPoint(
        intersectionPoints[i],
        intersectionPoints[i].endAnchor
      );
      anchors.splice(
        anchors.indexOf(intersectionPoints[i].endAnchor),
        0,
        gateLeft,
        gateRight
      );
    }
    return anchors;
  }
  calculateLineIntersections(areaAnchors) {
    const lineGroups = this.canvas.app.state.getAllOfType(C.TYPES.LINE_GROUP);
    var id,
      i,
      p1,
      p2,
      data,
      intersectionPoints = [];
    for (id in lineGroups) {
      for (i = 0; i < lineGroups[id].data.lines.length; i++) {
        data = lineGroups[id].data;
        p1 = lineTools.toAnchorPoint(data.anchors[data.lines[i][0]]);
        p2 = lineTools.toAnchorPoint(data.anchors[data.lines[i][1]]);
        intersectionPoints = intersectionPoints.concat(
          this.getLineIntersectionPoints(p1, p2, areaAnchors)
        );
      }
    }
    intersectionPoints.sort((a, b) => {
      if (a.distanceToOrigin === b.distanceToOrigin) {
        return 0;
      }
      if (a.distanceToOrigin > b.distanceToOrigin) {
        return 1;
      } else {
        return -1;
      }
    });
    return intersectionPoints;
  }
  getLineIntersectionPoints(p1, p2, areaAnchors) {
    var p3,
      p4,
      i,
      point,
      intersectionPoints = [];
    areaAnchors = areaAnchors.slice();
    areaAnchors.push(areaAnchors[0]);
    for (i = 0; i < areaAnchors.length - 1; i++) {
      p3 = areaAnchors[i];
      p4 = areaAnchors[i + 1];
      point = calc.getLineIntersectionPoint(p1, p2, p3, p4);
      if (point) {
        point.startAnchor = p3;
        point.endAnchor = p4;
        point.distanceToOrigin = calc.getDistanceBetweenPoints(point, p3);
        intersectionPoints.push(point);
      }
    }
    return intersectionPoints;
  }
  getOffsetIntersectionPoint(p1, p2) {
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    return {
      x: Math.cos(angle) * (GATE_WIDTH / 2) + p1.x,
      y: Math.sin(angle) * (GATE_WIDTH / 2) + p1.y,
    };
  }
  createMeshGeometry(anchors) {
    console.debug(
      "WARNING - This is a heavily refactored class, please test it"
    );
    // TODO: a lot broke here with THREE js updates, check if my fix is OK ...

    // this.mesh.geometry = new THREE.Geometry();
    this.mesh.geometry = new THREE.BufferGeometry();
    var i, x, y, j, vertice;

    let vertices = [];
    let faces = [];
    let isGate = [];

    for (i = 0; i < anchors.length; i++) {
      x = anchors[i].x * config.gridCellSize;
      y = anchors[i].y * config.gridCellSize;
      j = i * 2;

      vertices.push(x, 0, y);
      vertices.push(x, this.height, y);

      isGate.push(anchors[i].isGate);
      //   vertices.push(new THREE.Vector3(x, 0, y));
      //   vertice = new THREE.Vector3(x, this.height, y);
      //   vertice.isGate = anchors[i].isGate;
      //   vertices.push(vertice);
      if (i === anchors.length - 1) {
        faces.push(j, j + 1, 0);
        faces.push(0, 1, j + 1);

        // faces.push(new THREE.Face3(j, j + 1, 0));
        // faces.push(new THREE.Face3(0, 1, j + 1));
      } else if (!anchors[i].isGate) {
        faces.push(j, j + 1, j + 2);
        faces.push(j + 1, j + 3, j + 2);

        // faces.push(new THREE.Face3(j, j + 1, j + 2));
        // faces.push(new THREE.Face3(j + 1, j + 3, j + 2));
      }
    }

    this.mesh.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    this.mesh.geometry.setAttribute(
      "position_isGate",
      new THREE.Int8BufferAttribute(isGate, anchors.length)
    );
    this.mesh.geometry.setIndex(faces);

    this.mesh.geometry.computeVertexNormals();
    this.mesh.geometry.computeBoundingSphere();

    // this.mesh.geometry.computeFaceNormals();
    // this.mesh.geometry.normalsNeedUpdate = true;
    this.mesh.geometry.computeBoundingSphere();
  }
  createEdgeGeometry() {
    // this.edgeLines.geometry = new THREE.Geometry();
    // for (var i = 1; i < this.mesh.geometry.vertices.length - 1; i += 2) {
    //   if (!this.mesh.geometry.vertices[i].isGate) {
    //     this.edgeLines.geometry.vertices.push(
    //       this.mesh.geometry.vertices[i],
    //       this.mesh.geometry.vertices[i + 2]
    //     );
    //   }
    //   this.edgeLines.geometry.vertices.push(
    //     this.mesh.geometry.vertices[i - 1],
    //     this.mesh.geometry.vertices[i + 1]
    //   );
    //   this.edgeLines.geometry.vertices.push(
    //     this.mesh.geometry.vertices[i - 1],
    //     this.mesh.geometry.vertices[i]
    //   );
    // }
    // this.edgeLines.geometry.vertices.push(
    //   this.mesh.geometry.vertices[1],
    //   this.mesh.geometry.vertices[this.mesh.geometry.vertices.length - 1]
    // );
    // this.edgeLines.geometry.vertices.push(
    //   this.mesh.geometry.vertices[this.mesh.geometry.vertices.length - 2],
    //   this.mesh.geometry.vertices[this.mesh.geometry.vertices.length - 1]
    // );
    this.edgeLines.geometry = new THREE.BufferGeometry();
    const edgeVertices = [];

    for (
      var i = 1;
      i < this.mesh.geometry.attributes.position.count - 1;
      i += 2
    ) {
      const iPos = i * 3;

      // TODO: test this, maybe bugged !! index is i/2 bc it was node attribute before
      console.debug(this.mesh.geometry.attributes.position_isGate);
      if (!this.mesh.geometry.attributes.position_isGate[i / 2]) {
        edgeVertices.push(
          this.mesh.geometry.attributes.position.array[iPos], // vertices[i]
          this.mesh.geometry.attributes.position.array[iPos + 1],
          this.mesh.geometry.attributes.position.array[iPos + 2],

          this.mesh.geometry.attributes.position.array[iPos + 6], // vertices[i + 2]
          this.mesh.geometry.attributes.position.array[iPos + 7],
          this.mesh.geometry.attributes.position.array[iPos + 8]
        );
      }

      edgeVertices.push(
        this.mesh.geometry.attributes.position.array[iPos - 3], // vertices[i - 1]
        this.mesh.geometry.attributes.position.array[iPos - 2],
        this.mesh.geometry.attributes.position.array[iPos - 1],

        this.mesh.geometry.attributes.position.array[iPos + 3], // vertices[i + 1]
        this.mesh.geometry.attributes.position.array[iPos + 4],
        this.mesh.geometry.attributes.position.array[iPos + 5]
      );

      edgeVertices.push(
        this.mesh.geometry.attributes.position.array[iPos - 3], // vertices[i - 1]
        this.mesh.geometry.attributes.position.array[iPos - 2],
        this.mesh.geometry.attributes.position.array[iPos - 1],

        this.mesh.geometry.attributes.position.array[iPos], // vertices[i]
        this.mesh.geometry.attributes.position.array[iPos + 1],
        this.mesh.geometry.attributes.position.array[iPos + 2]
      );
    }

    const lastIndex = this.mesh.geometry.attributes.position.count - 1;
    const lastSecondIndex = lastIndex - 1;

    edgeVertices.push(
      this.mesh.geometry.attributes.position.array[3], // vertices[1]
      this.mesh.geometry.attributes.position.array[4],
      this.mesh.geometry.attributes.position.array[5],

      this.mesh.geometry.attributes.position.array[lastIndex * 3], // vertices[this.mesh.geometry.vertices.length - 1]
      this.mesh.geometry.attributes.position.array[lastIndex * 3 + 1],
      this.mesh.geometry.attributes.position.array[lastIndex * 3 + 2]
    );

    edgeVertices.push(
      this.mesh.geometry.attributes.position.array[lastSecondIndex * 3], // vertices[this.mesh.geometry.vertices.length - 2]
      this.mesh.geometry.attributes.position.array[lastSecondIndex * 3 + 1],
      this.mesh.geometry.attributes.position.array[lastSecondIndex * 3 + 2],

      this.mesh.geometry.attributes.position.array[lastIndex * 3], // vertices[this.mesh.geometry.vertices.length - 1]
      this.mesh.geometry.attributes.position.array[lastIndex * 3 + 1],
      this.mesh.geometry.attributes.position.array[lastIndex * 3 + 2]
    );

    this.edgeLines.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(edgeVertices, 3)
    );
  }
  destroy() {
    this.canvas.app.state.off(
      `${this.id}-${C.ACTIONS.UPDATE}`,
      this.update,
      this
    );
    this.canvas.app.state.off(
      `${C.ACTIONS.CREATE}-${C.TYPES.LINE_GROUP}`,
      this.update,
      this
    );
    this.canvas.app.state.off(
      `${C.ACTIONS.UPDATE}-${C.TYPES.LINE_GROUP}`,
      this.update,
      this
    );
    this.canvas.app.state.off(
      `${C.ACTIONS.DELETE}-${C.TYPES.LINE_GROUP}`,
      this.update,
      this
    );
    this.canvas.layerManager.off("change", this.applyLayerSettings, this);
    this.canvas.scene.remove(this.group);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.edgeLines.geometry.dispose();
    this.edgeLines.material.dispose();
  }
}
