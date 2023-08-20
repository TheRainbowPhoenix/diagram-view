declare global {
  interface Window {
    canvas: any; // TODO !!
    abortLaunch?: boolean;
  }
  interface Screen {
    deviceXDPI?: number;
    logicalXDPI?: number;
  }
}

export {};
