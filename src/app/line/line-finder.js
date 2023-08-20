import config from "../config";
import * as calc from "../tools/calc";
import * as lineTools from "./line-tools";

import C from "../constants";

export default class LineFinder {
  constructor(lineObject) {
    this.lineObject = lineObject;
  }
  destroy() {
    this.lineObject = null;
  }
  intersectsRectangle(rec) {
    const data = this.lineObject.canvas.app.state.getStateForId(
      this.lineObject.id
    );
    var i, ancA, ancB;
    for (i = 0; i < data.lines.length; i++) {
      ancA = lineTools.toAnchorPoint(data.anchors[data.lines[i][0]]);
      ancB = lineTools.toAnchorPoint(data.anchors[data.lines[i][1]]);
      if (!ancA || !ancB) {
        continue;
      }
      if (
        calc.doLinesIntersect(
          ancA.x,
          ancA.y,
          ancB.x,
          ancB.y,
          rec.x1,
          rec.y1,
          rec.x2,
          rec.y1
        ) ||
        calc.doLinesIntersect(
          ancA.x,
          ancA.y,
          ancB.x,
          ancB.y,
          rec.x2,
          rec.y1,
          rec.x2,
          rec.y2
        ) ||
        calc.doLinesIntersect(
          ancA.x,
          ancA.y,
          ancB.x,
          ancB.y,
          rec.x2,
          rec.y2,
          rec.x1,
          rec.y2
        ) ||
        calc.doLinesIntersect(
          ancA.x,
          ancA.y,
          ancB.x,
          ancB.y,
          rec.x1,
          rec.y2,
          rec.x1,
          rec.y1
        )
      ) {
        return true;
      }
    }
    return false;
  }
  setClosestSubPartHovered(planeIntersectionPoint) {
    var c = this.getClosestAnchorPoint(planeIntersectionPoint);
    if (c.distance < config.lineSelectionProximity) {
      c.type = C.SUB_PART_TYPES.ANCHOR_POINT;
      this.lineObject.subparts.setHovered(
        c.index,
        C.SUB_PART_TYPES.ANCHOR_POINT
      );
    } else {
      c = this.getClosestLineSegment(planeIntersectionPoint);
      if (c.distance < config.lineSelectionProximity) {
        this.lineObject.subparts.setHovered(
          c.index,
          C.SUB_PART_TYPES.LINE_SEGMENT
        );
      }
    }
  }
  getClosestAnchorPoint(point) {
    var minDistance = Infinity,
      distance,
      closestPointIndex,
      i;
    const data = this.lineObject.canvas.app.state.getStateForId(
      this.lineObject.id
    );
    for (i = 0; i < data.anchors.length; i++) {
      if (data.anchors[i] === null) {
        continue;
      }
      distance = calc.getDistanceBetweenPoints(
        point,
        lineTools.toAnchorPoint(data.anchors[i])
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestPointIndex = i;
      }
    }
    return {
      distance: minDistance,
      index: closestPointIndex,
    };
  }
  getClosestLineSegment(point) {
    var minDistance = Infinity,
      i,
      distance,
      closestLineSegmentIndex;
    const data = this.lineObject.canvas.app.state.getStateForId(
      this.lineObject.id
    );
    if (this.lineObject.type === C.TYPES.LINE_GROUP) {
      for (i = 0; i < data.lines.length; i++) {
        distance = calc.getDistanceToLine(
          point,
          lineTools.toAnchorPoint(data.anchors[data.lines[i][0]]),
          lineTools.toAnchorPoint(data.anchors[data.lines[i][1]])
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestLineSegmentIndex = i;
        }
      }
    } else if (this.lineObject.type === C.TYPES.AREA) {
      for (i = 0; i < data.anchors.length; i++) {
        if (i === data.anchors.length - 1) {
          distance = calc.getDistanceToLine(
            point,
            data.anchors[i],
            data.anchors[0]
          );
        } else {
          distance = calc.getDistanceToLine(
            point,
            data.anchors[i],
            data.anchors[i + 1]
          );
        }
        if (distance < minDistance) {
          minDistance = distance;
          closestLineSegmentIndex = i;
        }
      }
    }
    return {
      distance: minDistance,
      index: closestLineSegmentIndex,
    };
  }
}
