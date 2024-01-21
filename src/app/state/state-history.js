import config from "../config";
import * as tools from "../tools/tools";
import C from "../constants";

export default class StateHistory {
  constructor(state) {
    this.state = state;
    this.bwdTransactions = [];
    this.fwdTransactions = [];
    this.index = -1;
  }
  clear() {
    this.bwdTransactions = [];
    this.fwdTransactions = [];
    this.index = -1;
  }
  undo() {
    if (this.index < 0) {
      return;
    }
    this.state.processTransaction(this.bwdTransactions[this.index], true);
    this.index--;
    if (
      this.index >= 0 &&
      this.bwdTransactions[this.index + 1].transactionBlockIndex !== null &&
      this.bwdTransactions[this.index + 1].transactionBlockIndex ===
        this.bwdTransactions[this.index].transactionBlockIndex
    ) {
      this.undo();
    }
  }
  redo() {
    if (this.index >= this.fwdTransactions.length - 1) {
      return;
    }
    this.index++;
    this.state.processTransaction(this.fwdTransactions[this.index], true);
    if (
      this.fwdTransactions[this.index + 1] &&
      this.fwdTransactions[this.index].transactionBlockIndex !== null &&
      this.fwdTransactions[this.index].transactionBlockIndex ===
        this.fwdTransactions[this.index + 1].transactionBlockIndex
    ) {
      this.redo();
    }
  }
  getStableDataCopy(id) {
    return tools.deepClone(this.state.data[id].stableData);
  }
  addBwdTransaction(transaction, transactionBlockIndex) {
    this.fwdTransactions.splice(this.index + 1);
    this.bwdTransactions.splice(this.index + 1);
    const bwdTransaction = {
      id: transaction.id,
      transactionBlockIndex: transactionBlockIndex,
    };
    if (transaction.action === C.ACTIONS.UPDATE) {
      bwdTransaction.action = C.ACTIONS.SET;
      bwdTransaction.data = this.getStableDataCopy(transaction.id);
    } else if (transaction.action === C.ACTIONS.CREATE) {
      bwdTransaction.action = C.ACTIONS.DELETE;
    } else if (transaction.action === C.ACTIONS.DELETE) {
      bwdTransaction.action = C.ACTIONS.CREATE;
      bwdTransaction.type = this.state.data[transaction.id].type;
      bwdTransaction.data = this.getStableDataCopy(transaction.id);
    }
    this.bwdTransactions.push(bwdTransaction);
    this.index++;
  }
  addFwdTransaction(transaction, transactionBlockIndex) {
    const fwdTransaction = tools.deepClone(transaction);
    fwdTransaction.transactionBlockIndex = transactionBlockIndex;
    this.fwdTransactions.push(fwdTransaction);
  }
}
