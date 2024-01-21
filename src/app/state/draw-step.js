export default class DrawStep {
  constructor(name, args) {
    this.name = name;
    if (args !== undefined) {
      this.args = args instanceof Array ? args : [args];
    } else {
      this.args = [];
    }
  }
}
