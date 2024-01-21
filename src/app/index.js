// TODO
import * as THREE from "three";
import { Canvas } from "./canvas/canvas";

import config from "./config";
import * as tools from "./tools/tools";
import C from "./constants";
import ErrorReporter from "./tools/error-reporter";
import httpClient from "./tools/http-client";
import UserSettings from "./common/user-settings";
import AccountData from "./user/account-data";
import EventEmitter from "./tools/event-emitter";
import { setContext } from "svelte";
import { State } from "./state/state";
import ObjectRegistry from "./obj/object-registry";
import ObjectCreator from "./obj/object-creator";
import ObjectFinder from "./obj/object-finder";
import InteractionMode from "./tools/interaction-mode";

/**
 * @typedef {import("./types").App} AppType
 */

/**
 * @implements {AppType}
 */
class App {
  /**
   *
   * @param {HTMLElement} element root to attach canvas to
   */
  constructor(element) {
    this.data = {
      view: C.VIEWS.ADD,
      hideViewControls: tools.getQueryParam("hideViewControls") == "1",
    };
    this.$http = httpClient;

    this.errorReporter = new ErrorReporter(this.$http, this);
    this.userSettings = new UserSettings();
    this.accountData = new AccountData(null);
    this.eventHub = new EventEmitter();
    this.canvas = new Canvas(element, this);
    this.objects = new ObjectRegistry(this.canvas);
    this.state = new State(this);
    this.objectCreator = new ObjectCreator(this);
    this.interactionMode = new InteractionMode(this.canvas);
    this.objectFinder = new ObjectFinder(this);
    this.isEmbed = true;
    this.isLiveEmbed = tools.getQueryParam("live") === "true";
    this.accountData.set({
      isFreeAccount: false,
      isPayingUser: true,
    });

    this.$refs = {
      viewControls: {},
    }; // TODO: move away from vue
  }

  async init() {
    this.docId = tools.getQueryParam("id") || "demo-data";
    // if !docID => trigger fullscreenOverlay.showError("No ID specified", "GET parameter id not found in URL"), maybe from a store
    if (this.isLiveEmbed) {
      this.url = `embed-static/get-live-embed.json?id=${
        this.docId
      }&key=${tools.getQueryParam("key")}`;
    } else {
      this.url = "embed-static/get.json?id=" + this.docId;
    }

    const res = await this.$http.get(this.url);

    const cameraSettings = this.canvas.camera.persistence.fromHash(
      tools.getQueryParam("camera")
    );
    let settings;

    if (this.isLiveEmbed) {
      settings = {
        lastActiveDocId: this.docId,
        viewControlsOpen: true,
        activePlugIns: res.active_plugins,
        "aws-access-data": res.aws_access_data,
      };
    } else {
      settings = res.settings || {};
    }

    if (cameraSettings) {
      settings.cameraPosition = cameraSettings.cameraPosition;
      settings.cameraRotation = cameraSettings.cameraRotation;
      settings.zoom = cameraSettings.zoom;
      settings.cameraIsTopDown = cameraSettings.cameraIsTopDown;
      settings.cameraEuler = cameraSettings.cameraEuler;
    }
    this.userSettings.setAll(settings);
    // titleStore.set(" - Diagram Embed")
    this.state.persistence.setContents(0, res.content);
    this.$refs.viewControls.isDashboardMode = true; // make this a store
    // this.$emit("init");
    // this.$emit("userDataChange");
    this.eventHub.emit("init");

    return this;
  }

  tick() {
    return this.canvas.tick();
  }

  renderLoop() {
    return this.canvas.render();
  }

  destroy() {
    // TODO !
    this.canvas.stopRender = true;
  }
}

/**
 * Create the App and mount it in - anywhere !
 * @param {HTMLElement} root element to attach canvas to
 * @returns {AppType} Ready to use App
 */
export const mount = (root) => {
  if (window.abortLaunch) {
    return;
  }

  // var app = new Vue
  var app = new App(root);

  return app;
};

export default mount;
