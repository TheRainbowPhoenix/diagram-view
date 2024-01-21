Vue.component("view-controls", {
  template: `\n\t\t<div class="view-controls">\n\t\t\t<div class="toggle" @click="toggleOpen" v-if="!viewControlsOnly">\n\t\t\t\t<i class="fas fa-caret-right" v-if="isOpen"></i>\n\t\t\t\t<i class="fas fa-caret-left" v-if="!isOpen"></i>\n\t\t\t</div>\n\t\t\t<span @click="createNewDocument" v-if="!viewControlsOnly">\n\t\t\t\t<i class="fas fa-plus-square"></i>\n\t\t\t\t<label>new document</label>\n\t\t\t</span>\n\t\t\t<div class="group-seperator" v-if="!viewControlsOnly"></div>\n\t\t\t<i v-if="!viewControlsOnly" @click="undo" class="fas fa-reply" title="undo (ctrl + z)"></i>\n\t\t\t<i v-if="!viewControlsOnly" @click="redo" class="fas fa-share" title="redo (ctrl + y)"></i>\n\t\t\t<div v-if="!viewControlsOnly" class="group-seperator"></div>\n\t\t\t<i @click="pan" v-if="!viewControlsOnly || isDashboardMode" class="fas fa-expand-arrows-alt has-hint" title="pan canvas (space or middle mouse button)">\n\t\t\t\t<div class="hint" :class="{show: showHint}">\n\t\t\t\t\t<p>\n\t\t\t\t\t\tYou can also move the canvas by holding <b>space</b> or <b>middle mouse button / mousewheel</b>.<br />Cancel with right click.\n\t\t\t\t\t</p>\n\t\t\t\t\t<div class="tip"></div>\n\t\t\t\t</div>\n\t\t\t</i>\n\t\t\t<i @click="zoomOut" class="fas fa-search-minus" title="zoom out (mousewheel up)"></i>\n\t\t\t<i @click="zoomIn" class="fas fa-search-plus" title="zoom in (mousewheel down)"></i>\n\t\t\t<i @click="rotateLeft" class="fas fa-undo-alt" title="rotate view left (Q)"></i>\n\t\t\t<i @click="rotateRight" class="fas fa-redo-alt" title="rotate view right (E)"></i>\n\t\t\t<span class="text" @click="toggleTopDown" title="toggle between 2D and 3D Mode (X)">\n\t\t\t\t{{topDownLabel}}\n\t\t\t</span>\n\t\t\t<i @click="toggleDashboardMode" v-if="!isEmbed" class="fas fa-expand" :class="{active:isDashboardMode}" title="Presentation Mode (P)"></i>\n\t\t\t<div class="group-seperator" v-if="!isEmbed"></div>\n\t\t\t<span v-if="!isEmbed" title="layers" @click="setContextView('${CONTEXT_VIEW.LAYERS}')" :class="{active: contextView === '${CONTEXT_VIEW.LAYERS}'}">\n\t\t\t\t<layer-control v-if="contextView === '${CONTEXT_VIEW.LAYERS}'"></layer-control>\n\t\t\t\t<i class="fas fa-layer-group"></i>\n\t\t\t</span>\n\t\t\t<div class="group-seperator" v-if="!viewControlsOnly"></div>\n\t\t\t<span v-if="!isEmbed"  class="collab" title="collaborate with other users" @click="setContextView('${CONTEXT_VIEW.COLLABORATORS}')" :class="{active: contextView === '${CONTEXT_VIEW.COLLABORATORS}'}">\n\t\t\t\t<collab-control v-if="contextView === '${CONTEXT_VIEW.COLLABORATORS}'"></collab-control>\n\t\t\t\t<i class="fas fa-user-plus"></i>\n\t\t\t</span>\n\t\t\t<div class="group-seperator" v-if="isFreePlan && !viewControlsOnly"></div>\n\t\t\t<div \n\t\t\t\tclass="free-plan-count" \n\t\t\t\tv-if="isFreePlan && !viewControlsOnly" \n\t\t\t\t@click="upgradePlan" \n\t\t\t\t@animationend="onFreeItemsExceededAnimationEnd"\n\t\t\t\t:class="{exceeded: showExceeded }"\n\t\t\t>\n\t\t\t\t<div class="items">{{itemsRemaining}} of ${config.itemsInFreePlan} items remaining</div>\n\t\t\t\t<div class="label">upgrade to standard for infinite items</div>\n\t\t\t</div>\n\t\t\t<div class="group-seperator" v-if="!viewControlsOnly"></div>\n\t\t\t<span @click="setContextView('${CONTEXT_VIEW.FEEDBACK}')" v-if="!viewControlsOnly" :class="{active: contextView === '${CONTEXT_VIEW.FEEDBACK}'}">\n\t\t\t\t<feedback-form v-if="contextView === '${CONTEXT_VIEW.FEEDBACK}'"></feedback-form>\n\t\t\t\t<i class="far fa-comments"></i>\n\t\t\t</span>\n\t\t\t<div class="group-seperator" v-if="!viewControlsOnly"></div>\n\t\t\t<i @click="showControlHelp" v-if="!viewControlsOnly" class="fas fa-keyboard" title="Show Hotkeys"></i>\n\t\t\t<div class="group-seperator" v-if="!viewControlsOnly"></div>\n\t\t\t<i @click="logout" v-if="!viewControlsOnly" class="fas fa-power-off" title="logout"></i>\n\t\t</div>\n\t`,
  data: function () {
    return {
      viewControlsOnly: config.isEmbed,
      isEmbed: config.isEmbed,
      isOpen: null,
      contextView: null,
      isFreePlan: null,
      itemsRemaining: null,
      showExceeded: false,
      showHint: false,
      hintShown: false,
      isDashboardMode: false,
      topDownLabel: null,
    };
  },
  watch: {
    isOpen: function (isOpen) {
      if (isOpen) {
        this.$el.style.right = 0;
      } else {
        this.$el.style.right = -(this.$el.offsetWidth - 23) + "px";
      }
    },
  },
  created: function () {
    this.$root.$on("init", () => {
      this.$data.isOpen = this.$root.userSettings.get("viewControlsOpen");
      this.$root.canvas.camera.on("change", this.updateTopDownLabel, this);
      if (config.viewControlsOnly) {
        return;
      }
      this.setPlan();
      this.$root.accountData.on("change", this.setPlan, this);
      this.$root.state.on("change", this.updateItems, this);
      this.$root.state.on(
        "free-items-exceeded",
        this.onFreeItemsExceeded,
        this
      );
    });
  },
  methods: {
    toggleOpen() {
      this.$data.isOpen = !this.$data.isOpen;
      if (!this.$data.isOpen) {
        this.$data.showFeedbackForm = false;
      }
      this.$root.userSettings.set("viewControlsOpen", this.$data.isOpen);
    },
    createNewDocument() {
      this.$root.$refs.sidebar.setView(C.VIEWS.FILE);
      this.$root.$refs.sidebar.$refs.filePanel.externalCreateDocument();
    },
    setContextView(contextView) {
      if (this.$data.contextView === contextView) {
        this.$data.contextView = null;
      } else {
        this.$data.contextView = contextView;
      }
    },
    rotateLeft() {
      this.$root.canvas.camera.rotateLeft();
    },
    rotateRight() {
      this.$root.canvas.camera.rotateRight();
    },
    undo() {
      this.$root.state.history.undo();
    },
    redo() {
      this.$root.state.history.redo();
    },
    zoomIn() {
      this.$root.canvas.camera.changeZoomBy(1);
    },
    zoomOut() {
      this.$root.canvas.camera.changeZoomBy(-1);
    },
    toggleTopDown() {
      this.$root.canvas.camera.toggleTopDown();
    },
    updateTopDownLabel() {
      if (this.$root.canvas.camera.isTopDown) {
        this.$data.topDownLabel = "3D";
      } else {
        this.$data.topDownLabel = "2D";
      }
    },
    pan() {
      if (this.$data.hintShown === false) {
        this.$data.showHint = true;
        this.$data.hintShown = true;
        setTimeout(() => {
          this.$data.showHint = false;
        }, 5e3);
      }
      this.$root.interactionMode.set(C.INTERACTION_MODE.PAN_ON_DRAG);
    },
    showControlHelp() {
      this.$root.$refs.fullscreenOverlay.showControlsHelp();
    },
    upgradePlan() {
      this.$root.$refs.sidebar.setView(C.VIEWS.ACCOUNT);
    },
    setPlan() {
      this.$data.isFreePlan =
        this.$root.accountData.get("paymentPlan") === C.PAYMENT_PLAN.FREE;
    },
    updateItems() {
      this.$data.itemsRemaining =
        config.itemsInFreePlan - this.$root.state.countItems();
    },
    onFreeItemsExceeded() {
      this.$data.isOpen = true;
      this.$data.showExceeded = true;
    },
    onFreeItemsExceededAnimationEnd() {
      this.$data.showExceeded = false;
    },
    toggleDashboardMode() {
      if (this.$data.isDashboardMode === true) {
        this.$data.isDashboardMode = false;
        this.$data.viewControlsOnly = false;
        this.$root.$refs.sidebar.show();
        this.$root.$emit("dashboard-mode-off");
      } else {
        this.$data.isDashboardMode = true;
        this.$data.viewControlsOnly = true;
        this.$root.$refs.sidebar.hide();
        this.$root.$emit("dashboard-mode-on");
      }
    },
    logout() {
      this.$http.post("account/logout", {}).then(() => {
        window.location = document.location.origin + "?logout=true";
      });
    },
  },
});
