import config from "./config";

const CONSTANTS = {
  GENERIC: "generic",
  META: "meta",
  META_TYPES: {
    LAYER: "layer",
  },
  GRID: {
    OFFSET_X: config.gridWidth / config.gridCellSize / 2,
    OFFSET_Y: config.gridHeight / config.gridCellSize / 2,
    CELL_WIDTH_ON_CANVAS:
      config.textureCanvasWidth * (config.gridCellSize / config.gridWidth),
    CELL_HEIGHT_ON_CANVAS:
      config.textureCanvasHeight * (config.gridCellSize / config.gridHeight),
  },
  INTERACTION_MODE: {
    PLACE_COMPONENT: "place-component",
    PAN: "pan",
    PAN_ON_DRAG: "pan-on-drag",
    SELECT: "select",
    DRAW_LINES: "draw-lines",
    DRAW_AREA: "draw-area",
    ADD_LABEL: "add-label",
    ADD_ICON: "add-icon",
    ADD_IMAGE: "add-image",
    ADD_WIDGET: "add-widget",
  },
  AREA_TYPES: {
    STANDARD: 0,
    VPN: 1,
  },
  ANCHOR_TYPES: {
    STANDALONE: 0,
    OBJECT: 1,
  },
  SUB_PART_TYPES: {
    LINE_SEGMENT: 0,
    ANCHOR_POINT: 1,
  },
  LINE_DASH: {
    SOLID: 1,
    DASHED: 2,
    DOTTED: 3,
  },
  NOTIFICATION_TYPES: {
    SHARED_DOC: "shared-doc",
    DOC_STRUCTURE_CHANGE: "doc-structure-changed",
  },
  ACTIONS: {
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
    SET: "set",
  },
  TYPES: {
    COMPONENT: "component",
    LINE_GROUP: "line-group",
    LABEL: "label",
    ICON: "icon",
    AREA: "area",
    IMAGE: "image",
    WIDGET: "widget",
  },
  WIDGET_TYPES: {
    CHART: "chart",
    SCALE_GROUP: "scale-group",
  },
  EVENTS: {
    CELL_CHANGED: "cell-changed",
    HALF_CELL_CHANGED: "half-cell-changed",
    HALF_CELL_INTERSECTION_CHANGED: "half-cell-intersection-changed",
    QUARTER_CELL_CHANGED: "quarter-cell-changed",
    QUARTER_CELL_INTERSECTION_CHANGED: "quarter-cell-intersection-changed",
    EIGHTS_CELL_CHANGED: "quarter-cell-intersection-changed",
    RAW_POSITION_CHANGED: "raw-pos-changed",
  },
  VIEWS: {
    ADD: "add",
    SELECTION: "selection",
    FILE: "file",
    EXPORT: "export",
    ACCOUNT: "account",
    API: "api",
  },
  ERROR_TYPES: {
    HTTP_ERROR: "http-error",
    SCRIPT_ERROR: "script-error",
  },
  PAYMENT_PLAN: {
    FREE: "free",
    PAID: "paid",
    CANCELLED: "cancelled",
  },
  TIME_SPANS: {
    "1H": 36e5,
    "4H": 144e5,
    "8H": 288e5,
    "1D": 864e5,
    "2D": 1728e5,
    "3D": 2592e5,
    "1W": 6048e5,
  },
};
CONSTANTS.PIXEL_OBJECT_TYPES = {};
CONSTANTS.PIXEL_OBJECT_TYPES[CONSTANTS.TYPES.LABEL] = true;
CONSTANTS.PIXEL_OBJECT_TYPES[CONSTANTS.TYPES.ICON] = true;
CONSTANTS.PIXEL_OBJECT_TYPES[CONSTANTS.TYPES.IMAGE] = true;
CONSTANTS.BOX_SELECTION_TYPES = {};
CONSTANTS.BOX_SELECTION_TYPES[CONSTANTS.TYPES.COMPONENT] = true;
CONSTANTS.BOX_SELECTION_TYPES[CONSTANTS.TYPES.LABEL] = true;
CONSTANTS.BOX_SELECTION_TYPES[CONSTANTS.TYPES.ICON] = true;
CONSTANTS.BOX_SELECTION_TYPES[CONSTANTS.TYPES.IMAGE] = true;
CONSTANTS.BOX_SELECTION_TYPES[CONSTANTS.TYPES.USER] = true;

export default CONSTANTS;
