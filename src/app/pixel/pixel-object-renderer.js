import config from "../config";
import C from "../constants";
import styles from "../common/styles";
import Rectangle from "../geometry/rectangle";
import ICONS from "../common/icons";

const SOLID = "solid";
const FONTSIZE_TO_LINEWIDTH = 15;

export default class PixelObjectRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    setTimeout(this.init.bind(this), 1);
  }
  init() {
    this.canvas.interactionPlane.plane.on(
      "render",
      this.renderInteractions,
      this
    );
    this.canvas.pixelPlane.plane.on("render", this.renderObjects, this, 2);
  }
  renderInteractions() {
    const objects = this.canvas.app.objects.getAll();
    for (var id in objects) {
      if (
        (objects[id].type === C.TYPES.IMAGE ||
          objects[id].showResizeOnSelect) &&
        objects[id].isSelected &&
        objects[id].isEditable
      ) {
        this.renderImageResizeHandles(objects[id]);
      }
    }
  }
  renderObjects() {
    var obj, id;
    for (id in this.canvas.app.state.data) {
      obj = this.canvas.app.state.data[id];
      if (!this.canvas.layerManager.isVisible(obj)) {
        continue;
      }
      if (obj.type === C.TYPES.LABEL) {
        this.renderLabel(obj.data, id);
      } else if (obj.type === C.TYPES.ICON) {
        this.renderIcon(obj.data, id);
      } else if (obj.type === C.TYPES.IMAGE) {
        this.renderImage(obj.data, id);
      } else if (obj.type === C.TYPES.WIDGET) {
        this.canvas.app.objects.getById(id).render(obj.data, id);
      } else if (obj.data.showMetaData === true) {
        this.renderMetaData(obj.data, id);
      }
    }
  }
  setIconFont(data, plane) {
    plane = plane || this.canvas.pixelPlane.plane;
    if (ICONS[data.icon].style === SOLID) {
      plane.setFont(data.fontSize, '"Font Awesome 5 Free"', {
        bold: true,
        italic: false,
      });
    } else {
      plane.setFont(data.fontSize, '"Font Awesome 5 Brands"', {
        bold: false,
        italic: false,
      });
    }
  }
  renderMetaData(data, id) {
    const fontFamily =
      '"Open Sans",-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
    const rotationAxisIsX = Math.floor(data.metaDataRotation) % 3 === 0;
    const sizeOnGrid = window.canvas.app.objects.getById(id).model.sizeOnGrid;
    this.canvas.pixelPlane.plane.setTextAlign(data.metaDataTextAlign);
    var i = 1 - data.metaDataFontSize,
      x = data.position.x,
      y = data.position.y,
      w = sizeOnGrid.width,
      h = sizeOnGrid.height,
      o = 0,
      pos,
      key;
    if (data.metaDataTextAlign === "center") {
      o = 0.5;
    } else if (data.metaDataTextAlign === "right") {
      o = 1;
    }
    const dir = data.metaDataRotation ? Math.floor(data.metaDataRotation) : 0;
    if (dir === 1 || dir === 3) {
      i = 0;
    }
    for (key in data.meta) {
      i += data.metaDataFontSize * (data.showMetaDataKeys ? 2 : 1.4);
      if (dir === 0) {
        pos = {
          x: x + w * o,
          y: y + i,
        };
      } else if (dir === 1) {
        pos = {
          x: x - i,
          y: y + h * o,
        };
      } else if (dir === 3) {
        pos = {
          x: x + 1 - o,
          y: y - i,
        };
      } else if (dir === 4) {
        pos = {
          x: x + i,
          y: y + 1 - o,
        };
      }
      if (data.showMetaDataKeys) {
        this.canvas.pixelPlane.plane.setFillStyle("#666666");
        this.canvas.pixelPlane.plane.setFont(
          data.metaDataFontSize * 0.6,
          fontFamily,
          {
            bold: true,
            italic: false,
          }
        );
        this.canvas.pixelPlane.plane.fillText(key, pos, data.metaDataRotation);
      }
      pos = {
        x: pos.x,
        y: pos.y,
      };
      if (dir === 0) {
        pos.y += data.metaDataFontSize;
      } else if (dir === 1) {
        pos.x += data.metaDataFontSize;
      } else if (dir === 3) {
        pos.y -= data.metaDataFontSize;
      } else if (dir === 4) {
        pos.x += data.metaDataFontSize;
      }
      this.canvas.pixelPlane.plane.setFillStyle("#222222");
      this.canvas.pixelPlane.plane.setFont(data.metaDataFontSize, fontFamily, {
        bold: true,
        italic: false,
      });
      this.canvas.pixelPlane.plane.fillText(
        data.meta[key],
        pos,
        data.metaDataRotation
      );
    }
  }
  renderLabel(data, id) {
    const obj = this.canvas.app.objects.getById(id);
    if (!obj) {
      return;
    }
    this.canvas.pixelPlane.plane.setTextAlign(data.textAlign);
    this.canvas.pixelPlane.plane.setFont(
      data.fontSize,
      data.fontFamily,
      data.fontStyle
    );
    this.canvas.pixelPlane.plane.setFillStyle(data.color);
    const lines = data.text.split("\n");
    const lineHeight = data.fontSize * styles.label.lineHeight;
    const dir = Math.floor(data.rotation);
    var i, pos;
    if (data.outlineColor !== styles.transparentColor) {
      this.canvas.pixelPlane.plane.setLineWidth(data.outlineWidth);
      this.canvas.pixelPlane.plane.setStrokeStyle(data.outlineColor);
    }
    for (i = 0; i < lines.length; i++) {
      if (dir === 0) {
        pos = {
          x: data.position.x,
          y: data.position.y + i * lineHeight,
        };
      } else if (dir === 1) {
        pos = {
          x: data.position.x - i * lineHeight,
          y: data.position.y,
        };
      } else if (dir === 3) {
        pos = {
          x: data.position.x,
          y: data.position.y - i * lineHeight,
        };
      } else if (dir === 4) {
        pos = {
          x: data.position.x + i * lineHeight,
          y: data.position.y,
        };
      }
      if (data.outlineColor !== styles.transparentColor) {
        this.canvas.pixelPlane.plane.strokeText(
          lines[i],
          pos,
          data.rotation,
          pos
        );
      }
      this.canvas.pixelPlane.plane.fillText(lines[i], pos, data.rotation, pos);
    }
    obj.computeBoundingBox(data, true);
  }
  renderIcon(data, id) {
    const obj = this.canvas.app.objects.getById(id);
    if (!obj) {
      return;
    }
    const center = obj.computeBoundingBox().getCenter();
    center.x -= 0.01;
    center.y -= 0.01;
    this.setIconFont(data);
    this.canvas.pixelPlane.plane.setTextAlign("center");
    this.canvas.pixelPlane.plane.setFillStyle(data.color);
    if (data.outlineColor !== styles.transparentColor) {
      this.canvas.pixelPlane.plane.setLineWidth(data.outlineWidth);
      this.canvas.pixelPlane.plane.setStrokeStyle(data.outlineColor);
      this.canvas.pixelPlane.plane.strokeText(
        ICONS[data.icon].unicode,
        center,
        data.rotation,
        center
      );
    }
    this.canvas.pixelPlane.plane.fillText(
      ICONS[data.icon].unicode,
      center,
      data.rotation,
      center
    );
  }
  renderImage(data, id) {
    const srcImage = this.canvas.imageCache.getImage(data.path);
    var x, y, width, height, _x, _y, _width, _height;
    if (data.rotation % Math.PI === 0) {
      _width = data.dimensions.width;
      _height = data.dimensions.height;
      _x = data.position.x;
      _y = data.position.y;
    } else {
      _width = data.dimensions.height;
      _height = data.dimensions.width;
      _x =
        data.position.x +
        data.dimensions.width / 2 -
        data.dimensions.height / 2;
      _y =
        data.position.y +
        data.dimensions.height / 2 -
        data.dimensions.width / 2;
    }
    if (data.stretchToSize || srcImage === null) {
      x = _x;
      y = _y;
      width = _width;
      height = _height;
    } else {
      if (srcImage.width / srcImage.height > _width / _height) {
        width = _width;
        height = (_width / srcImage.width) * srcImage.height;
        x = _x;
        y = _y + (_height - height) / 2;
      } else {
        height = _height;
        width = (_height / srcImage.height) * srcImage.width;
        x = _x + (_width - width) / 2;
        y = _y;
      }
    }
    if (srcImage === null) {
      this.canvas.pixelPlane.plane.setFillStyle("#CCC");
      this.canvas.pixelPlane.plane.fillRect(
        new Rectangle(x, y, x + width, y + height)
      );
    } else {
      this.canvas.pixelPlane.plane.drawImage(
        srcImage,
        x,
        y,
        width,
        height,
        data.rotation
      );
    }
  }
  renderImageResizeHandles(img) {
    const bb = img.computeBoundingBox();
    const anchors = bb.getAnchors();
    this.canvas.interactionPlane.plane.setStrokeStyle(styles.themeColor);
    this.canvas.interactionPlane.plane.setLineWidth(0.04);
    this.canvas.interactionPlane.plane.setLineDash([0.1, 0.1]);
    this.canvas.interactionPlane.plane.strokeRect(bb);
    this.canvas.interactionPlane.plane.setLineDash([]);
    this.canvas.interactionPlane.plane.setFillStyle(styles.themeColor);
    for (var i = 0; i < anchors.length; i++) {
      this.canvas.interactionPlane.plane.drawCircle(
        anchors[i],
        0.15,
        false,
        true
      );
    }
    if (img.hoveredAnchor && !img.selectedAnchor) {
      this.canvas.interactionPlane.plane.setFillStyle(
        styles.selection.hoverColor
      );
      this.canvas.interactionPlane.plane.drawCircle(
        img.hoveredAnchor,
        0.2,
        false,
        true
      );
    }
  }
}
