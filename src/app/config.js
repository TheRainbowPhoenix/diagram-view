const config = {
  logoFolder: "components/logos/",
  itemsInFreePlan: 30,
  gridCellSize: 10,
  gridWidth: 1e3,
  gridHeight: 1e3,
  textureCanvasWidth: 2048,
  textureCanvasHeight: 2048,
  pixelPerUnit: 128,
  minSelectionSize: 0.4,
  lineSelectionProximity: 0.2,
  undoSteps: 100,
  labelDefaultWidth: 4,
  labelDefaultHeight: 1,
  labelDefaultText: "New Label",
  defaultImagePath: "no-image-selected.png",
  isLocalMode: true,
  minZoom: 1,
  maxZoom: 30,
  zoomPerWheelDelta: 1.2,
  camMin: -920,
  camMax: 920,
  continuousPanPerFrame: 1 / 60,
  rotationAnimationDuration: 40,
  transactionSaveBufferTime: 1e3,
  userSettingSaveBufferTime: 2e3,
};
const isDevelopmentMode =
  typeof document !== "undefined" &&
  document.location.href.indexOf("localhost") > -1;
config.blankImagePath = config.logoFolder + "blank.png";
if (config.isLocalMode) {
  config.httpRoot = "/api/";
  config.imageRoot = "/user-images/";
} else if (document.location.host.startsWith("pt.")) {
  config.httpRoot = "https://pt.arcentry.com/pt/";
  config.imageRoot = "https://pt.arcentry.com/arcentry-pt-images/";
  config.stripeApiKey = "pk_test_I5cS5gt2oRrTbDZFvc2LEsnq";
} else if (document.location.host.indexOf("127.0.0.1") > -1) {
  config.httpRoot = document.location.host + "/api/";
  config.imageRoot = document.location.host + "/arcentry-prod-images/";
  config.stripeApiKey = "pk_test_I5cS5gt2oRrTbDZFvc2LEsnq";
} else if (isDevelopmentMode) {
  config.httpRoot = "https://arcentry.com/dev/";
  config.imageRoot =
    "https://s3.eu-central-1.amazonaws.com/arcentry-dev-images/";
  config.stripeApiKey = "pk_test_I5cS5gt2oRrTbDZFvc2LEsnq";
} else {
  config.httpRoot = "https://arcentry.com/api/";
  config.imageRoot = "https://arcentry.com/arcentry-prod-images/";
  config.stripeApiKey = "pk_live_ocIHH8sMbicZQLh6Ox990c9k";
}
config.isEmbed = document.location.href.indexOf("embed.html") > -1;

export default config;
