import models from "./models";
import componentConfig from "./component-config";

const components = createComponentList();

export const getComponentStructure = function () {
  return componentConfig;
};

export const getModel = function (key) {
  if (!models[key]) {
    console.warn("Unknown Model " + key);
    return null;
  }
  return models[key];
};

export const getComponentConfig = function (componentId) {
  if (!components[componentId]) {
    console.warn("Unknown component config " + componentId);
    return null;
  }
  return components[componentId];
};
export const getModelForComponentId = function (componentId) {
  return models[componentConfig[componentId].model];
};

function createComponentList() {
  var id,
    category,
    components = {};
  for (category in componentConfig) {
    for (id in componentConfig[category].components) {
      components[id] = componentConfig[category].components[id];
    }
  }
  return components;
}
