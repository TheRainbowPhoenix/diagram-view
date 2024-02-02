import Rectangle from "../geometry/rectangle";
import C from "../constants";

export const toAnchorPoint = function (anchorPoint) {
  if (anchorPoint === null) {
    return null;
  } else if (anchorPoint.type === C.ANCHOR_TYPES.STANDALONE) {
    return anchorPoint;
  } else if (anchorPoint.type === C.ANCHOR_TYPES.OBJECT) {
    const obj = window.canvas.app.objects.getById(anchorPoint.id);
    if (!obj || !obj.anchorPoint || !obj.anchorPoints.anchors) {
      return {
        x: anchorPoint.x || 0,
        y: anchorPoint.y || 0,
        type: C.ANCHOR_TYPES.STANDALONE,
      };
    }
    return obj.anchorPoints.anchors[anchorPoint.index];
  } else {
    return anchorPoint;
  }
};

export const computeBoundingBox = function (data) {
  var x1 = Infinity,
    y1 = Infinity,
    x2 = -Infinity,
    y2 = -Infinity,
    i,
    anchor;
  for (i = 0; i < data.anchors.length; i++) {
    if (data.anchors[i] === null) {
      continue;
    }
    anchor = toAnchorPoint(data.anchors[i]);
    if (anchor.x < x1) {
      x1 = anchor.x;
    }
    if (anchor.x > x2) {
      x2 = anchor.x;
    }
    if (anchor.y < y1) {
      y1 = anchor.y;
    }
    if (anchor.y > y2) {
      y2 = anchor.y;
    }
  }
  return new Rectangle(x1, y1, x2, y2);
};
