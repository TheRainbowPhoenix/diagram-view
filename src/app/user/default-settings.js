import config from "../config";

import C from "../constants";

const DEFAULTS = {
  sidebarWidth: 280,
  customColors: [],
  sidebarView: C.VIEWS.ADD,
  viewControlsOpen: true,
  showTipOfDay: true,
  tipOfDayIndex: 0,
  dashboardMode: false,
  zoom: 7.66666,
  cameraPosition: [450, 450, 450],
  cameraRotation: 0.7853981633974483,
  cameraEuler: null,
  cameraIsTopDown: false,
  componentOpacity: 1,
  componentRotation: 0,
  labelFontColor: "#404040",
  labelFontSize: 0.5,
  labelFontFamily:
    '"Open Sans",-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  labelFontStyle: {
    bold: false,
    italic: false,
  },
  labelTextAlign: "left",
  labelOutlineColor: "#FFFFFF",
  labelOutlineWidth: 0.1,
  labelRotation: 0,
  metaDataShow: false,
  metaDataFontSize: 0.5,
  metaDataTextAlign: "left",
  metaDataShowKeys: true,
  metaDataRotation: 0,
  lineColor: "#e61898",
  lineWidth: 0.05,
  lineDash: C.LINE_DASH.SOLID,
  areaLineColor: "#CCCCCC",
  areaLineWidth: 0.05,
  areaFillColor: "#FAFAFA",
  areaShadowLevel: 0,
  iconColor: "#404040",
  iconFontSize: 0.5,
  icon: "star",
  iconRotation: 0,
  iconOutlineColor: "#FFFFFF",
  iconOutlineWidth: 0.025,
  imageRotation: 0,
  imageStretchToSize: false,
  lastActiveDocId: null,
  genericBackgroundColor: "#FFFFFF",
  genericPrimaryColor: "#999999",
  genericIconColor: "#333333",
  exportDownloadAsImageSettings: {
    rectangle: {
      x1: 600,
      y1: 200,
      x2: 1e3,
      y2: 400,
    },
    newImageWidth: 500,
    newImageHeight: 400,
    widthLocked: true,
    heightLocked: false,
    transparentBackground: false,
    mimeType: "image/png",
    quality: 1,
    gridVisible: true,
  },
  "aws-access-data": null,
  activePlugIns: [],
  widgetChartLineColor: "#e61898",
  widgetChartFillChart: true,
  widgetChartShowLabels: true,
  widgetChartPlotType: "line",
  widgetScaleGroupLineColor: "#E68818",
  widgetScaleGroupLineWidth: 0.05,
  widgetScaleGroupFillColor: "#E6AB18",
  widgetScaleGroupShadowLevel: 0,
};

export default DEFAULTS;
