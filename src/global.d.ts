declare global {
  interface Window {
    canvas: any; // TODO !!
    abortLaunch?: boolean;
    Pusher: any;
  }
  interface Screen {
    deviceXDPI?: number;
    logicalXDPI?: number;
  }
  interface Document {
    selection: any;
  }
  canvas: any;
}

export {};
