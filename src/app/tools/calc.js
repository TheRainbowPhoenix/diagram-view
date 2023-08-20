export const getDistanceBetweenPoints = function (pointA, pointB) {
  const a = pointA.x - pointB.x;
  const b = pointA.y - pointB.y;
  return Math.sqrt(a * a + b * b);
};

export const getDistanceToLine = function (point, linePointA, linePointB) {
  var A = point.x - linePointA.x;
  var B = point.y - linePointA.y;
  var C = linePointB.x - linePointA.x;
  var D = linePointB.y - linePointA.y;
  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) {
    param = dot / len_sq;
  }
  var xx, yy;
  if (param < 0) {
    xx = linePointA.x;
    yy = linePointA.y;
  } else if (param > 1) {
    xx = linePointB.x;
    yy = linePointB.y;
  } else {
    xx = linePointA.x + param * C;
    yy = linePointA.y + param * D;
  }
  var dx = point.x - xx;
  var dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

export const getClosestPoint = function (pos, points) {
  var i,
    minDistance = Infinity,
    distance,
    minIndex;
  for (i = 0; i < points.length; i++) {
    distance = getDistanceBetweenPoints(pos, points[i]);
    if (distance < minDistance) {
      minDistance = distance;
      minIndex = i;
    }
  }
  return {
    distance: minDistance,
    index: minIndex,
    point: points[minIndex],
  };
};

export const doLinesIntersect = function (a, b, c, d, p, q, r, s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
};

export const getLineIntersectionPoint = function (p1, p2, p3, p4) {
  const point = {
    x:
      ((p1.x * p2.y - p2.x * p1.y) * (p3.x - p4.x) -
        (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) /
      ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)),
    y:
      ((p1.x * p2.y - p2.x * p1.y) * (p3.y - p4.y) -
        (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) /
      ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)),
  };
  if (isPointBetween(point, p1, p2) && isPointBetween(point, p3, p4)) {
    return point;
  } else {
    return null;
  }
};

function isPointBetween(p, a, b) {
  return (
    ((a.x <= p.x && p.x <= b.x) || (a.x >= p.x && p.x >= b.x)) &&
    ((a.y <= p.y && p.y <= b.y) || (a.y >= p.y && p.y >= b.y))
  );
}
