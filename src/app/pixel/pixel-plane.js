import config from "../config";
import C from "../constants";

export default class PixelPlane {
  constructor(canvas) {
    this.canvas = canvas;
    this.addType = null;
    this.creationInProgress = false;
    this.plane = new AbstractPlane(this.canvas, 0.005);
    this.plane.setLineCap("round");
    this.plane.setLineJoin("round");
    this.plane.enableTextBlending();
    this.interactions = new PixelPlaneInteractions(canvas);
    this.pixelObjectRenderer = new PixelObjectRenderer(canvas);
    this.createStateFn = null;
    if (document.fonts) {
      document.fonts.onloadingdone = this.onFontsLoaded.bind(this);
    }
    setTimeout(this.init.bind(this), 1);
  }
  init() {
    this.canvas.app.state.on("create-label", this.createPixelObject, this);
    this.canvas.app.state.on("delete-label", this.deletePixelObject, this);
    this.canvas.app.state.on("create-icon", this.createPixelObject, this);
    this.canvas.app.state.on("delete-icon", this.deletePixelObject, this);
    this.canvas.app.state.on("create-image", this.createPixelObject, this);
    this.canvas.app.state.on("delete-image", this.deletePixelObject, this);
    this.canvas.app.state.on("create-widget", this.createPixelObject, this);
    this.canvas.app.state.on("delete-widget", this.deletePixelObject, this);
  }
  startAddWidget(createStateFn) {
    this.createStateFn = createStateFn;
    this.addType = C.TYPES.WIDGET;
    this.interactions.showAddPosition(3, 2);
  }
  startAddLabel() {
    this.addType = C.TYPES.LABEL;
    this.interactions.showAddPosition(
      config.labelDefaultWidth,
      config.labelDefaultHeight
    );
  }
  startAddIcon() {
    this.addType = C.TYPES.ICON;
    this.interactions.showAddPosition(0.5, 0.5);
  }
  startAddImage() {
    this.addType = C.TYPES.IMAGE;
    this.interactions.showAddPosition(3, 2);
  }
  stopAdd() {
    this.addType = null;
    this.interactions.endAdd();
  }
  onFontsLoaded(event) {
    this.plane.scheduleRender();
  }
  getPixelObjectForPoint(point) {
    const objects = this.canvas.app.objects.getAll();
    for (var id in objects) {
      if (
        objects[id] instanceof PixelObject &&
        objects[id].boundingBox.containsPoint(point)
      ) {
        return objects[id];
      }
    }
    return null;
  }
  createPixelObject(transaction) {
    var pixelObject;
    if (
      transaction.type === C.TYPES.WIDGET &&
      this.canvas.widgetManager.isPixelWidget(transaction.data.widgetType)
    ) {
      pixelObject = this.canvas.widgetManager.createWidget(transaction.id);
    } else if (transaction.type === C.TYPES.IMAGE) {
      pixelObject = new PixelObjectImage(this.canvas, transaction.id);
    } else if (transaction.type === C.TYPES.LABEL) {
      pixelObject = new PixelObjectLabel(this.canvas, transaction.id);
    } else {
      pixelObject = new PixelObject(
        this.canvas,
        transaction.id,
        transaction.type
      );
    }
    this.canvas.app.objects.add(pixelObject);
    if (this.creationInProgress) {
      if (!transaction.isTransient) {
        this.canvas.app.interactionMode.endActiveMode();
        this.creationInProgress = false;
      }
      this.canvas.selectionManager.clearCurrentSelection();
      if (transaction.isTransient) {
        this.canvas.selectionManager.addObjectToSelection(pixelObject);
      }
      requestAnimationFrame(() => {
        const labelTextInput = document.querySelector(
          '.label-settings input[type="text"]'
        );
        if (labelTextInput) {
          labelTextInput.focus();
        }
      });
    }
  }
  deletePixelObject(transaction) {
    this.canvas.app.objects.removeById(transaction.id);
  }
  createPixelObjectState(rectangle) {
    if (!this.addType) {
      return;
    }
    this.creationInProgress = true;
    const data = {
      position: {
        x: rectangle.x1,
        y: rectangle.y1,
      },
      dimensions: {
        width: rectangle.width,
        height: rectangle.height,
      },
    };
    if (this.createStateFn) {
      this.createStateFn(data, this.canvas);
      this.createStateFn = null;
    }
    if (this.addType === C.TYPES.LABEL) {
      data.color = this.canvas.app.userSettings.get("labelFontColor");
      data.fontSize = this.canvas.app.userSettings.get("labelFontSize");
      data.fontFamily = this.canvas.app.userSettings.get("labelFontFamily");
      data.fontStyle = this.canvas.app.userSettings.get("labelFontStyle");
      data.text = config.labelDefaultText;
      data.textAlign = this.canvas.app.userSettings.get("labelTextAlign");
      data.outlineColor = this.canvas.app.userSettings.get("labelOutlineColor");
      data.rotation = this.canvas.app.userSettings.get("labelRotation");
    } else if (this.addType === C.TYPES.ICON) {
      data.icon = this.canvas.app.userSettings.get("icon");
      data.color = this.canvas.app.userSettings.get("iconColor");
      data.fontSize = this.canvas.app.userSettings.get("iconFontSize");
      data.rotation = this.canvas.app.userSettings.get("iconRotation");
      data.outlineColor = this.canvas.app.userSettings.get("iconOutlineColor");
      data.outlineWidth = this.canvas.app.userSettings.get("iconOutlineWidth");
    } else if (this.addType === C.TYPES.IMAGE) {
      data.path = config.defaultImagePath;
      data.stretchToSize =
        this.canvas.app.userSettings.get("imageStretchToSize");
      data.rotation = this.canvas.app.userSettings.get("imageRotation");
    }
    const id = this.canvas.app.state.generateId();
    this.canvas.app.state.processTransaction({
      id: id,
      type: this.addType,
      action: C.ACTIONS.CREATE,
      data: data,
    });
    return id;
  }
}
