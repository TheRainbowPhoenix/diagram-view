import EventEmitter from "../tools/event-emitter";
import C from "../constants";

export default class AccountData extends EventEmitter {
  constructor(httpClient) {
    super();
    this.httpClient = httpClient;
    this.isReady = false;
    this.data = {};
  }
  isFreePlan() {
    return this.data.paymentPlan === C.PAYMENT_PLAN.FREE;
  }
  get(key) {
    if (typeof this.data[key] === "undefined") {
      return null;
    } else {
      return this.data[key];
    }
  }
  set(data) {
    for (var key in data) {
      this.data[key] = data[key];
    }
    if (this.data.isPayingUser === false) {
      this.data.paymentPlan = C.PAYMENT_PLAN.FREE;
    } else if (this.data.isPayingUser === true) {
      if (this.data.subscriptionEnd) {
        this.data.paymentPlan = C.PAYMENT_PLAN.CANCELLED;
      } else {
        this.data.paymentPlan = C.PAYMENT_PLAN.PAID;
      }
    }
    if (this.data.subscriptionEnd) {
      this.data.subscriptionEnd = this.formatDate(this.data.subscriptionEnd);
    }
    this.emit("change");
  }
  formatDate(date) {
    return new Date(date).toLocaleString();
  }
  load(callback) {
    this.httpClient.get("account/get-user-data").then((res) => {
      this.isReady = true;
      this.set(res.body);
      callback();
    });
  }
}
