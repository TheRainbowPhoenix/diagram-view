import C from "../constants";

const STYLES = {
  transparentColor: "#00000000",
  themeColor: "#e61898",
  label: {
    lineHeight: 1.1,
  },
  grid: {
    background: "#030304", // "#181a1c", // #FFF //
    primaryLineColor: "#08080A", // "#202024", // #CCC
    secondaryLineColor: "#0C0C0E", //"#313133", // "#EEE",
  },
  selectionRectangle: {
    background: "#e6189833",
    border: "#e61898CC",
    borderWidth: 0.03,
    lineDash: [0.03, 0.03],
  },
  highlighting: {
    trueColor: "#16d68266",
    falseColor: "#d63f1666",
    placementColor: "#e6189866",
    positionIndicatorLineColor: "#CCCCCC",
    dimensionIndicatorLineColor: "#e61898",
  },
  lineDrawing: {
    hoverHighlightOpacity: "33",
    anchorPointOpacity: "66",
    hoverHighlightWidth: 0.15,
    anchorPointToLineWidthOffset: 0.1,
  },
  lineHelper: {
    lineWidth: 0.05,
    lineColor: "#e61898",
    lineDash: [0.05],
    radius: 0.2,
  },
  area: {
    hoverHighlightOpacity: "33",
    hoverHighlightWidth: 0.15,
    transparentOutlineInteractionColor: "#e6189866",
  },
  objectAnchorPoint: {
    lineWidth: 0.02,
    color: "#99999999",
    radius: 0.1,
  },
  selection: {
    hoverColor: "#e6189866",
    selectColor: "#e61898CC",
    selectionBoxPadding: 0.1,
    selectionBoxSideLength: 0.15,
    selectionBoxLineWidth: 0.03,
  },
};
STYLES.lineDrawing.lineDash = [];
STYLES.lineDrawing.lineDash[C.LINE_DASH.SOLID] = [];
STYLES.lineDrawing.lineDash[C.LINE_DASH.DASHED] = [0.1, 0.25];
STYLES.lineDrawing.lineDash[C.LINE_DASH.DOTTED] = [0.005, 0.15];
export default STYLES;
