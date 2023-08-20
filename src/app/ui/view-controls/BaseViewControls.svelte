<script>
  import config from "../../config";
  import CONSTANTS from "../../constants";

  const CONTEXT_VIEW = {
    FEEDBACK: "feedback",
    COLLABORATORS: "collaborators",
    LAYERS: "layers",
  };

  let viewControlsOnly = config.isEmbed;
  let isEmbed = config.isEmbed;
  let isOpen = null;
  let contextView = null;
  let isFreePlan = null;
  let itemsRemaining = null;
  let showExceeded = false;
  let showHint = false;
  let hintShown = false;
  let isDashboardMode = false;
  let topDownLabel = null;

  let offsetWidth = 0;

  let style = {
    /** @type {number | string}*/
    right: 0,
  };

  $: {
    isOpen ? (style.right = 0) : (style.right = -(offsetWidth - 23) + "px");
  }
  /*
   isOpen: function (isOpen) {
        if (isOpen) {
          this.$el.style.right = 0;
        } else {
          this.$el.style.right = -(this.$el.offsetWidth - 23) + "px";
        }
      }, 
  */

  /*
  Vue.component("view-controls", {
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
  */
</script>

<div class="view-controls">
  <div class="toggle" data-click="toggleOpen" data-v-if="!viewControlsOnly">
    <i class="fas fa-caret-right" data-v-if="isOpen" />
    <i class="fas fa-caret-left" data-v-if="!isOpen" />
  </div>
  <span data-click="createNewDocument" data-v-if="!viewControlsOnly">
    <i class="fas fa-plus-square" />
    <label>new document</label>
  </span>
  <div class="group-seperator" data-v-if="!viewControlsOnly" />
  <i
    data-v-if="!viewControlsOnly"
    data-click="undo"
    class="fas fa-reply"
    title="undo (ctrl + z)"
  />
  <i
    data-v-if="!viewControlsOnly"
    data-click="redo"
    class="fas fa-share"
    title="redo (ctrl + y)"
  />
  <div data-v-if="!viewControlsOnly" class="group-seperator" />
  <i
    data-click="pan"
    data-v-if="!viewControlsOnly || isDashboardMode"
    class="fas fa-expand-arrows-alt has-hint"
    title="pan canvas (space or middle mouse button)"
  >
    <div class="hint" class:show={showHint}>
      <p>
        You can also move the canvas by holding <b>space</b> or
        <b>middle mouse button / mousewheel</b>.<br />Cancel with right click.
      </p>
      <div class="tip" />
    </div>
  </i>
  <i
    data-click="zoomOut"
    class="fas fa-search-minus"
    title="zoom out (mousewheel up)"
  />
  <i
    data-click="zoomIn"
    class="fas fa-search-plus"
    title="zoom in (mousewheel down)"
  />
  <i
    data-click="rotateLeft"
    class="fas fa-undo-alt"
    title="rotate view left (Q)"
  />
  <i
    data-click="rotateRight"
    class="fas fa-redo-alt"
    title="rotate view right (E)"
  />
  <span
    class="text"
    data-click="toggleTopDown"
    title="toggle between 2D and 3D Mode (X)"
  >
    {{ topDownLabel }}
  </span>
  <i
    data-click="toggleDashboardMode"
    data-v-if="!isEmbed"
    class="fas fa-expand"
    class:active={isDashboardMode}
    title="Presentation Mode (P)"
  />
  <div class="group-seperator" data-v-if="!isEmbed" />
  <span
    data-v-if="!isEmbed"
    title="layers"
    data-click="setContextView('${CONTEXT_VIEW.LAYERS}')"
    class:active={contextView === "${CONTEXT_VIEW.LAYERS}"}
  >
    <layer-control data-v-if="contextView === '${CONTEXT_VIEW.LAYERS}'" />
    <i class="fas fa-layer-group" />
  </span>
  <div class="group-seperator" data-v-if="!viewControlsOnly" />
  <span
    data-v-if="!isEmbed"
    class="collab"
    title="collaborate with other users"
    data-click="setContextView('${CONTEXT_VIEW.COLLABORATORS}')"
    class:active={contextView === "${CONTEXT_VIEW.COLLABORATORS}"}
  >
    <collab-control
      data-v-if="contextView === '${CONTEXT_VIEW.COLLABORATORS}'"
    />
    <i class="fas fa-user-plus" />
  </span>
  <div class="group-seperator" data-v-if="isFreePlan && !viewControlsOnly" />
  <div
    class="free-plan-count"
    data-v-if="isFreePlan && !viewControlsOnly"
    data-click="upgradePlan"
    data-animationend="onFreeItemsExceededAnimationEnd"
    class:exceeded={showExceeded}
  >
    <div class="items">
      {{ itemsRemaining }} of ${config.itemsInFreePlan} items remaining
    </div>
    <div class="label">upgrade to standard for infinite items</div>
  </div>
  <div class="group-seperator" data-v-if="!viewControlsOnly" />
  <span
    data-click="setContextView('${CONTEXT_VIEW.FEEDBACK}')"
    data-v-if="!viewControlsOnly"
    class:active={contextView === "${CONTEXT_VIEW.FEEDBACK}"}
  >
    <feedback-form data-v-if="contextView === '${CONTEXT_VIEW.FEEDBACK}'" />
    <i class="far fa-comments" />
  </span>
  <div class="group-seperator" data-v-if="!viewControlsOnly" />
  <i
    data-click="showControlHelp"
    data-v-if="!viewControlsOnly"
    class="fas fa-keyboard"
    title="Show Hotkeys"
  />
  <div class="group-seperator" data-v-if="!viewControlsOnly" />
  <i
    data-click="logout"
    data-v-if="!viewControlsOnly"
    class="fas fa-power-off"
    title="logout"
  />
</div>

<style>
  /* TODO */
</style>
