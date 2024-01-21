export default class Animation {
  constructor(fn, frames) {
    this.fn = fn;
    this.totalFrames = frames;
    this.currentFrame = 0;
    this.completeCallback = null;
  }
  complete() {
    this.currentFrame = this.totalFrames;
    this.fn(1);
    this.destroy();
  }
  isComplete() {
    return this.currentFrame >= this.totalFrames;
  }
  destroy() {
    this.fn = null;
    this.totalFrames = null;
    this.currentFrame = null;
    if (this.completeCallback) {
      this.completeCallback();
    }
    this.completeCallback = null;
  }
}
