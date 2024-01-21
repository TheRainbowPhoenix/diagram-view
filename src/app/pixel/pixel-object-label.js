import PixelObject from "./pixel-object";
import C from "../constants";
import Rectangle from "../geometry/rectangle";
import * as calc from "../tools/calc";
import styles from "../common/styles";

const LEFT = "left";
const CENTER = "center";
const RIGHT = "right";
const TOP = "top";
const MIDDLE = "middle";
const BOTTOM = "bottom";

export default class PixelObjectLabel extends PixelObject {
  constructor(canvas, id) {
    super(canvas, id, C.TYPES.LABEL);
    this.currentState = null;
  }
  alignWith(pos, dir) {
    const data = this.canvas.app.state.getStateForId(this.id);
    const bb = this.computeBoundingBox(null, true);
    const rot = Math.floor(data.rotation);
    const halfLine = data.fontSize / 2;
    var x = data.position.x;
    var y = data.position.y;
    if (rot === 0) {
      if (dir === LEFT) {
        y = pos.y;
      } else if (dir === MIDDLE || dir === RIGHT) {
        y = pos.y + halfLine;
      } else if (dir === TOP || dir === CENTER || dir === BOTTOM) {
        if (data.textAlign === LEFT) {
          x = pos.x;
        } else if (data.textAlign === CENTER) {
          x = pos.x + bb.width / 2;
        } else if (data.textAlign === RIGHT) {
          x = pos.x + bb.width;
        }
      }
    } else if (rot === 3) {
      if (dir === RIGHT || dir === MIDDLE || dir === LEFT) {
        y = pos.y + bb.height - halfLine;
      }
      if (dir === TOP || dir === CENTER || dir === BOTTOM) {
        if (data.textAlign === LEFT) {
          x = pos.x + bb.width;
        } else if (data.textAlign === CENTER) {
          x = pos.x + bb.width / 2;
        } else if (data.textAlign === RIGHT) {
          x = pos.x;
        }
      }
    } else if (rot === 1) {
      if (dir === RIGHT || dir === MIDDLE || dir === LEFT) {
        if (data.textAlign === LEFT) {
          y = pos.y;
        } else if (data.textAlign === CENTER) {
          y = pos.y + bb.height / 2;
        } else if (data.textAlign === RIGHT) {
          y = pos.y + bb.height;
        }
      }
      if (dir === TOP || dir === CENTER || dir === BOTTOM) {
        x = pos.x + bb.width - halfLine;
      }
    } else if (rot === 4) {
      if (dir === RIGHT || dir === MIDDLE || dir === LEFT) {
        if (data.textAlign === LEFT) {
          y = pos.y + bb.height;
        } else if (data.textAlign === CENTER) {
          y = pos.y + bb.height / 2;
        } else if (data.textAlign === RIGHT) {
          y = pos.y;
        }
      }
      if (dir === TOP || dir === CENTER || dir === BOTTOM) {
        x = pos.x + halfLine;
      }
    }
    this.canvas.app.state.processTransaction({
      action: C.ACTIONS.UPDATE,
      id: this.id,
      data: {
        position: {
          x: x,
          y: y,
        },
      },
    });
  }
  computeBoundingBox(data, force) {
    if (!this.isPristine && !force) {
      return this.boundingBox;
    }
    if (!data) {
      data = this.canvas.app.state.getStateForId(this.id);
    }
    const lines = data.text.split("\n");
    const lineHeight = data.fontSize * styles.label.lineHeight;
    const rot = Math.floor(data.rotation);
    var height = lineHeight * lines.length - (lineHeight - data.fontSize);
    var textWidth,
      width = 0,
      i,
      x,
      y,
      x1,
      y1,
      x2,
      y2,
      xOffset = 0,
      yOffset = 0;
    for (i = 0; i < lines.length; i++) {
      textWidth = this.canvas.pixelPlane.plane.measureText(lines[i]);
      if (textWidth > width) {
        width = textWidth;
      }
    }
    if (rot === 0 || rot === 3) {
      x = data.position.x;
      y = data.position.y - data.fontSize / 2;
    } else {
      x = data.position.x + data.fontSize / 2;
      y = data.position.y;
    }
    if (rot === 0) {
      x1 = x;
      y1 = y;
      x2 = x + width;
      y2 = y + height;
      xOffset = -1;
    } else if (rot === 3) {
      x1 = x - width;
      y1 = y - height;
      x2 = x;
      y2 = y;
      y1 += data.fontSize;
      y2 += data.fontSize;
      xOffset = 1;
    } else if (rot === 1) {
      x1 = x - height;
      y1 = y + width;
      x2 = x;
      y2 = y;
      yOffset = -1;
    } else if (rot === 4) {
      x1 = x + height;
      y1 = y - width;
      x2 = x;
      y2 = y;
      x1 -= data.fontSize;
      x2 -= data.fontSize;
      yOffset = 1;
    }
    if (data.textAlign === CENTER) {
      const halfWidth = width / 2;
      x1 += halfWidth * xOffset;
      x2 += halfWidth * xOffset;
      y1 += halfWidth * yOffset;
      y2 += halfWidth * yOffset;
    } else if (data.textAlign === RIGHT) {
      x1 += width * xOffset;
      x2 += width * xOffset;
      y1 += width * yOffset;
      y2 += width * yOffset;
    }
    this.boundingBox.set(x1, y1, x2, y2);
    this.isPristine = false;
    return this.boundingBox;
  }
}
