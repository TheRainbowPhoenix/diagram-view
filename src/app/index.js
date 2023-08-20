// TODO
import * as THREE from "three";
import { Canvas } from "./canvas/canvas";

import config from "./config";
import * as tools from "./tools/tools";
import C from "./constants";

/**
 * Create the App and mount it in - anywhere !
 * @returns {import("./types").App} Ready to use App
 */
export const mount = () => {
  if (window.abortLaunch) {
    return;
  }

  // var app = new Vue
  var app = {
    data: {
      view: C.VIEWS.ADD,
      hideViewControls: tools.getQueryParam("hideViewControls") == "1",
    },
  };

  return app;
};

export default mount;
