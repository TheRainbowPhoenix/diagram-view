import BaseObject from "./object-base";
import config from "../config";
import * as objectData from "./object-data";
import C from "../constants";

export default class ObjectCreator {
  constructor(app) {
    this.app = app;
    this.app.state.on("create-component", this.createComponent, this);
    this.app.state.on("delete-component", this.deleteComponent, this);
  }

  getComponentCreateTransition(componentId) {
    const data = {
      componentId: componentId,
      position: {
        x: null,
        y: null,
      },
      rotation: this.app.userSettings.get("componentRotation"),
      opacity: 1,
    };

    if (componentId.split(".")[0] === C.GENERIC) {
      data.primaryColor = this.app.userSettings.get("genericPrimaryColor");
      data.backgroundColor = this.app.userSettings.get(
        "genericBackgroundColor"
      );
      data.imagePath = config.blankImagePath;
      data.iconColor = this.app.userSettings.get("genericIconColor");
    }

    return {
      action: C.ACTIONS.CREATE,
      type: C.TYPES.COMPONENT,
      id: this.app.state.generateId(),
      data: data,
    };
  }

  createComponent(transaction) {
    const config = objectData.getComponentConfig(transaction.data.componentId);
    if (!config) {
      return null;
    }
    const component = new BaseObject(
      config,
      this.app.canvas,
      transaction
      //   true
    );
    this.app.canvas.scene.add(component.getThreeObject());
    this.app.objects.add(component);
  }

  deleteComponent(transaction) {
    const component = this.app.objects.getById(transaction.id);
    this.app.objects.remove(component);
    this.app.canvas.pixelPlane.plane.scheduleRender();
  }
}
