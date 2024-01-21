import EventEmitter from "../tools/event-emitter";
import config from "../config";
import * as tools from "../tools/tools";
import C from "../constants";
import StateHistory from "./state-history";
import HttpPersistence from "./http-persistence";
import PubSub from "../tools/pub-sub";
import Meta from "./meta";

const OBJECT = "object";
const NUMBER = "number";

export class State extends EventEmitter {
  constructor(app) {
    super();
    this.app = app;
    this.data = {};
    this.hasActiveTransactionBlock = false;
    this.transactionBlockIndex = 0;
    this.history = new StateHistory(this);
    this.persistence = new HttpPersistence(this);
    this.pubSub = new PubSub(this.app);
    this.meta = new Meta(this);
    this.isTransientPhase = false;
  }
  startTransientPhase() {
    this.isTransientPhase = true;
  }
  endTransientPhase() {
    this.isTransientPhase = false;
  }
  createFromData(data) {
    for (var id in data) {
      this.processTransaction({
        id: id,
        type: data[id].type,
        action: C.ACTIONS.CREATE,
        data: data[id].data,
      });
    }
  }
  generateId() {
    return (
      Date.now().toString(32) +
      "-" +
      Math.floor(Math.random() * 1e14).toString(32)
    );
  }
  getStateForId(id, copy) {
    if (!this.data[id]) {
      return null;
    } else if (copy) {
      return tools.deepClone(this.data[id].data);
    } else {
      return this.data[id].data;
    }
  }
  getTypeForId(id) {
    if (!this.data[id]) {
      return null;
    } else {
      return this.data[id].type;
    }
  }
  setState(state) {
    this.destroyCurrentState();
    this.data = state;
    var i, id;
    outer: for (id in this.data) {
      if (!this.data[id].data) {
        console.warn("received state without data", this.data[id], id);
        delete this.data[id];
        continue;
      }
      if (this.data[id].data.lines) {
        for (i = 0; i < this.data[id].data.lines.length; i++) {
          if (
            typeof this.data[id].data.lines[i][0] !== NUMBER ||
            typeof this.data[id].data.lines[i][1] !== NUMBER
          ) {
            console.warn("found corrupted line group", this.data[id], id);
            delete this.data[id];
            continue outer;
          }
        }
      }
      this.data[id].stableData = tools.deepClone(this.data[id].data);
      try {
        this.broadcastTransaction({
          action: C.ACTIONS.CREATE,
          id: id,
          type: this.data[id].type,
          data: this.data[id].data,
        });
      } catch (e) {
        console.warn("error while creating object with id " + id, e);
        this.processTransaction({
          action: C.ACTIONS.DELETE,
          id: id,
        });
      }
    }
    this.emit("change");
    this.emit("state-loaded");
  }
  countItems() {
    return Object.keys(this.data).length;
  }
  destroyCurrentState() {
    this.history.clear();
    for (var id in this.data) {
      this.broadcastTransaction({
        action: C.ACTIONS.DELETE,
        type: this.data[id].type,
        id: id,
      });
    }
    this.data = {};
    this.emit("change");
  }
  broadcastTransaction(transaction, _type) {
    const type = _type || transaction.type || this.data[transaction.id].type;
    const action =
      transaction.action === C.ACTIONS.SET
        ? C.ACTIONS.UPDATE
        : transaction.action;
    this.emit(transaction.id + "-" + action, transaction);
    this.emit(action + "-" + type, transaction);
  }
  checkForChanges(transaction) {
    var key, subkey;
    for (key in transaction.data) {
      if (typeof transaction.data[key] === OBJECT) {
        for (subkey in transaction.data[key]) {
          if (
            this.data[transaction.id].data[key] &&
            transaction.data[key][subkey] !==
              this.data[transaction.id].data[key][subkey]
          ) {
            return true;
          }
        }
      } else {
        if (transaction.data[key] !== this.data[transaction.id].data[key]) {
          return true;
        }
      }
    }
    return false;
  }
  processTransaction(transaction, skipHistory, isExternal) {
    if (this.app.accountData.isFreePlan()) {
      const itemsCount = this.countItems();
      if (itemsCount > 20) {
        this.app.trackEvent("items", "more than 20", "count", itemsCount);
      }
      if (
        transaction.action === C.ACTIONS.CREATE &&
        this.countItems() >= config.itemsInFreePlan
      ) {
        this.app.trackEvent(
          "items",
          "free items exceeded",
          "count",
          itemsCount
        );
        this.emit("free-items-exceeded");
        return;
      }
    }
    if (transaction.action !== C.ACTIONS.CREATE && !this.data[transaction.id]) {
      console.warn("received transaction for unknown id");
      return;
    }
    const type = transaction.type || this.data[transaction.id].type;
    const transactionBlockIndex = this.hasActiveTransactionBlock
      ? this.transactionBlockIndex
      : null;
    if (this.isTransientPhase) {
      transaction.isTransient = true;
    }
    if (skipHistory !== true && !transaction.isTransient) {
      this.history.addBwdTransaction(transaction, transactionBlockIndex);
    }
    if (transaction.action === C.ACTIONS.CREATE) {
      this.data[transaction.id] = {
        type: transaction.type,
        data: transaction.data,
      };
    } else if (transaction.action === C.ACTIONS.UPDATE) {
      for (var key in transaction.data) {
        this.data[transaction.id].data[key] = transaction.data[key];
      }
    } else if (transaction.action === C.ACTIONS.SET) {
      this.data[transaction.id].data = transaction.data;
    } else if (transaction.action === C.ACTIONS.DELETE) {
      delete this.data[transaction.id];
    }
    if (
      transaction.action !== C.ACTIONS.DELETE &&
      (!transaction.isTransient || isExternal)
    ) {
      this.data[transaction.id].stableData = tools.deepClone(
        this.data[transaction.id].data
      );
    }
    if (skipHistory !== true && !transaction.isTransient) {
      this.history.addFwdTransaction(transaction, transactionBlockIndex);
    }
    if (!transaction.isTransient) {
      this.persistence.processTransaction(transaction);
    }
    this.broadcastTransaction(transaction, type);
    this.emit("change");
  }
  getAllOfType(type) {
    const result = {};
    for (var id in this.data) {
      if (this.data[id].type === type) {
        result[id] = this.data[id];
      }
    }
    return result;
  }
  startTransactionBlock(label) {
    this.hasActiveTransactionBlock = true;
    this.transactionBlockIndex++;
  }
  endTransactionBlock() {
    this.hasActiveTransactionBlock = false;
  }
}
