import C from "../constants";
import EventEmitter from "../tools/event-emitter";

export default class Meta extends EventEmitter {
  constructor(state) {
    super();
    this.state = state;
    this.docMeta = {};
  }
  setDocMeta(docMeta) {
    this.docMeta = docMeta;
    this.emit("doc-meta-changed");
  }
  save(key, value) {
    const metaKey = this.createMetaKey(key);
    if (!this.state.getStateForId(metaKey)) {
      this.state.processTransaction({
        action: C.ACTIONS.CREATE,
        id: metaKey,
        type: C.META,
        data: {
          value: value,
        },
      });
    } else {
      this.state.processTransaction({
        action: C.ACTIONS.UPDATE,
        id: metaKey,
        data: {
          value: value,
        },
      });
    }
  }
  load(key) {
    const metaKey = this.createMetaKey(key);
    const data = this.state.getStateForId(metaKey);
    if (data && data.value) {
      return data.value;
    } else {
      return null;
    }
  }
  createMetaKey(key) {
    return C.META + "-" + key;
  }
}
