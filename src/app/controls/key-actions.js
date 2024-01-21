import KEYS from "./keys";
import C from "../constants";

const KEY_ACTIONS = {};

KEY_ACTIONS[KEYS.ESC] = {
  desc: "Cancel current action",
  up: (keyboardControls, canvas) => {
    canvas.app.eventHub.emit("user-cancel");
  },
};
KEY_ACTIONS[KEYS.DELETE] = KEY_ACTIONS[KEYS.BACKSPACE] = {
  isManipulation: true,
  desc: "Delete currently selected item(s)",
  up: (keyboardControls, canvas) => {
    keyboardControls.emit("delete");
  },
};
KEY_ACTIONS[KEYS.SPACE] = {
  desc: "Pan Canvas",
  down: (keyboardControls, canvas) => {
    canvas.app.interactionMode.set(C.INTERACTION_MODE.PAN);
  },
  up: (keyboardControls, canvas) => {
    canvas.app.interactionMode.endActiveMode(true);
  },
};
KEY_ACTIONS[KEYS.Y] = {
  isManipulation: true,
  ctrlDesc: "Redo last undo",
  down: (keyboardControls, canvas, event) => {
    if (keyboardControls.ctrlKeyPressed()) {
      event.preventDefault();
      canvas.app.state.history.redo();
    }
  },
};
KEY_ACTIONS[KEYS.Z] = {
  isManipulation: true,
  ctrlDesc: "Undo last action",
  down: (keyboardControls, canvas, event) => {
    if (keyboardControls.ctrlKeyPressed()) {
      event.preventDefault();
      if (event.shiftKey) {
        canvas.app.state.history.redo();
      } else {
        canvas.app.state.history.undo();
      }
    }
  },
};
KEY_ACTIONS[KEYS.S] = {
  isManipulation: true,
  desc: "Rotate Selected Item Left",
  down: (keyboardControls, canvas, event) => {
    canvas.app.eventHub.emit("rotate-item-left");
  },
};
KEY_ACTIONS[KEYS.D] = {
  isManipulation: true,
  desc: "Rotate Selected Item Right",
  down: (keyboardControls, canvas, event) => {
    canvas.app.eventHub.emit("rotate-item-right");
  },
};
KEY_ACTIONS[KEYS.L] = {
  isManipulation: true,
  desc: "Draw Lines",
  down: (keyboardControls, canvas, event) => {
    canvas.app.interactionMode.set(C.INTERACTION_MODE.DRAW_LINES);
  },
};
KEY_ACTIONS[KEYS.A] = {
  isManipulation: true,
  desc: "Draw Area",
  ctrlDesc: "Select All",
  down: (keyboardControls, canvas, event) => {
    if (keyboardControls.ctrlKeyPressed()) {
      event.preventDefault();
      canvas.selectionManager.addMultipleObjectsToSelection(
        canvas.app.objects.getAll()
      );
    } else {
      canvas.app.interactionMode.set(C.INTERACTION_MODE.DRAW_AREA);
    }
  },
};
KEY_ACTIONS[KEYS.P] = {
  desc: "Toggle Dashboard Mode",
  down: (keyboardControls, canvas, event) => {
    canvas.app.$refs.viewControls.toggleDashboardMode();
  },
};
KEY_ACTIONS[KEYS.I] = {
  isManipulation: true,
  desc: "Add Icon",
  down: (keyboardControls, canvas, event) => {
    canvas.app.interactionMode.set(C.INTERACTION_MODE.ADD_ICON);
  },
};
KEY_ACTIONS[KEYS.B] = {
  isManipulation: true,
  desc: "Add Label",
  down: (keyboardControls, canvas, event) => {
    canvas.app.interactionMode.set(C.INTERACTION_MODE.ADD_LABEL);
  },
};
KEY_ACTIONS[KEYS.E] = {
  desc: "Rotate Canvas Left",
  down: (keyboardControls, canvas, event) => {
    canvas.camera.rotateLeft();
  },
};
KEY_ACTIONS[KEYS.Q] = {
  desc: "Rotate Canvas Right",
  down: (keyboardControls, canvas, event) => {
    canvas.camera.rotateRight();
  },
};
KEY_ACTIONS[KEYS.X] = {
  desc: "Toggle 2D/3D",
  down: (keyboardControls, canvas, event) => {
    canvas.camera.toggleTopDown();
  },
};
const PAN_ACTION = {
  desc: "Pan Canvas",
  down: (keyboardControls, canvas, event) => {
    canvas.continuousPan.reset();
  },
  up: (keyboardControls, canvas, event) => {
    canvas.continuousPan.reset();
  },
};
KEY_ACTIONS[KEYS.ARROW_LEFT] = PAN_ACTION;
KEY_ACTIONS[KEYS.ARROW_DOWN] = PAN_ACTION;
KEY_ACTIONS[KEYS.ARROW_RIGHT] = PAN_ACTION;
KEY_ACTIONS[KEYS.ARROW_UP] = PAN_ACTION;

export default KEY_ACTIONS;
