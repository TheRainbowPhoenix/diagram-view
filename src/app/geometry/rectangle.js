import config from "../config";
import Point from "./point";

export default class Rectangle {
  constructor(x1, y1, x2, y2) {
    this.x1 = null;
    this.x2 = null;
    this.y1 = null;
    this.y2 = null;
    this.width = null;
    this.height = null;
    this.set(x1, y1, x2, y2);
  }
  static fromWorldCoordinates(x1, y1, x2, y2) {
    return new this(
      x1 / config.gridCellSize,
      y1 / config.gridCellSize,
      x2 / config.gridCellSize,
      y2 / config.gridCellSize
    );
  }
  static fromPoints(pointA, pointB) {
    return new this(pointA.x, pointA.y, pointB.x, pointB.y);
  }
  static fromPointAndSize(point, sizes) {
    return new this(
      point.x,
      point.y,
      point.x + sizes.width,
      point.y + sizes.height
    );
  }
  getSerializable() {
    return {
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
    };
  }
  setFromSerializable(s) {
    this.set(s.x1, s.y1, s.x2, s.y2);
  }
  clone() {
    return new Rectangle(this.x1, this.y1, this.x2, this.y2);
  }
  set(x1, y1, x2, y2) {
    this.x1 = Math.min(x1, x2);
    this.y1 = Math.min(y1, y2);
    this.x2 = Math.max(x1, x2);
    this.y2 = Math.max(y1, y2);
    this.width = this.x2 - this.x1;
    this.height = this.y2 - this.y1;
  }
  setDimensions(width, height) {
    this.width = width;
    this.height = height;
    this.x2 = this.x1 + this.width;
    this.y2 = this.y1 + this.height;
  }
  setPosition(point) {
    this.x1 = point.x;
    this.y1 = point.y;
    this.x2 = this.x1 + this.width;
    this.y2 = this.y1 + this.height;
  }
  getTopLeft() {
    return new Point(this.x1, this.y1);
  }
  getCenter() {
    return new Point(this.x1 + this.width / 2, this.y1 + this.height / 2);
  }
  getAnchors() {
    return [
      {
        x: this.x1,
        y: this.y1,
      },
      {
        x: this.x2,
        y: this.y1,
      },
      {
        x: this.x2,
        y: this.y2,
      },
      {
        x: this.x1,
        y: this.y2,
      },
    ];
  }
  intersects(rectangleB) {
    return !(
      rectangleB.x1 > this.x2 ||
      rectangleB.x2 < this.x1 ||
      rectangleB.y1 > this.y2 ||
      rectangleB.y2 < this.y1
    );
  }
  isWithin(rectangleB) {
    return (
      rectangleB.x1 >= this.x1 &&
      rectangleB.x2 <= this.x2 &&
      rectangleB.y1 >= this.y1 &&
      rectangleB.y2 <= this.y2
    );
  }
  containsPoint(point) {
    return (
      point.x > this.x1 &&
      point.x < this.x2 &&
      point.y > this.y1 &&
      point.y < this.y2
    );
  }
}
