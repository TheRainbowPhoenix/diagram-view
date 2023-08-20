export default class EventEmitter {
  constructor() {
    this.listener = {};
  }

  on(eventName, fn, context, order) {
    if (!this.listener[eventName]) {
      this.listener[eventName] = [];
    }
    this.listener[eventName].push({
      eventName: eventName,
      fn: fn,
      context: context,
      order: order,
    });
    this.listener[eventName].sort((a, b) => {
      return a.order > b.order ? 1 : -1;
    });
  }

  off(eventName, fn, context) {
    if (!this.listener[eventName]) {
      return;
    }
    var i = this.listener[eventName].length;
    while (i--) {
      if (
        this.listener[eventName][i].fn === fn &&
        this.listener[eventName][i].context === context
      ) {
        this.listener[eventName].splice(i, 1);
      }
    }
    if (this.listener[eventName].length === 0) {
      delete this.listener[eventName];
    }
  }

  emit(eventName) {
    if (!this.listener[eventName]) {
      return;
    }
    const args = Array.prototype.slice.call(arguments, 1);
    var last = null;
    var i = 0;
    while (this.listener[eventName] && this.listener[eventName][i]) {
      last = this.listener[eventName][i];
      if (
        this.listener[eventName][i].fn.apply(
          this.listener[eventName][i].context,
          args
        ) === false
      ) {
        return;
      }
      if (this.listener[eventName] && this.listener[eventName][i] === last) {
        i++;
      }
    }
  }

  hasListeners(eventName) {
    return this.listener[eventName] && this.listener[eventName].length > 0;
  }
}
