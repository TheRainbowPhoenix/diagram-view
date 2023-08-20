import C from "../constants";

export default class ErrorReporter {
  constructor(httpClient, app) {
    this.httpClient = httpClient;
    this.app = app;
    this.errorsSent = 0;
    window.addEventListener("error", this.onScriptError.bind(this), true);
  }
  onScriptError(errorEvent) {
    if (!errorEvent.message) {
      return;
    }
    var stack = "-";
    console.warn("Encountered error:", errorEvent);
    if (errorEvent.error && errorEvent.error.stack) {
      stack = errorEvent.error.stack;
    }
    this.reportError(
      C.ERROR_TYPES.SCRIPT_ERROR,
      `\n            Message: ${errorEvent.message}\n            Column: ${errorEvent.colno}\n            Line: ${errorEvent.lineno}\n            StackTrace: ${stack}\n        `
    );
  }
  reportError(type, message) {
    this.errorsSent++;
    if (this.errorsSent > 5) {
      return;
    }
    setTimeout(() => {
      this.httpClient.post("feedback/report-error", {
        type: type,
        message: message,
      });
    }, 20);
  }
}
