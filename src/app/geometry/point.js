import config from "../config";

export default class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isPoint = true;
  }
  static fromThreePoint(threePoint) {
    return new this(
      threePoint.x / config.gridCellSize,
      threePoint.z / config.gridCellSize
    );
  }
  static fromPoint(point) {
    return new this(point.x, point.y);
  }
  clone() {
    return new Point(this.x, this.y);
  }
  getSerializable() {
    return {
      x: this.x,
      y: this.y,
    };
  }
  equals(point) {
    return point.x === this.x && point.y === this.y;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
  }
}
