import config from "../config";
import httpClient from "../tools/http-client";

export default class HttpPersistence {
  constructor(state) {
    this.state = state;
    this.activeDocId = null;
    this.activeDocVersion = null;
    this.isInitialLoad = true;
    this.pendingTransactions = {};
  }
  setActiveDocId(docId) {
    if (this.activeDocId === docId) {
      return;
    }
    this.activeDocId = docId;
    httpClient
      .get("docs/get?docId=" + docId)
      .then((res) => {
        this.setContents(res.body.version, res.body.content || {});
        this.state.meta.setDocMeta({
          id: res.body.id,
          created: new Date(res.body.created),
          updated: new Date(res.body.updated),
          liveEmbedEnabled: res.body.live_embed_enabled,
          liveEmbedKey: res.body.live_embed_key,
          guestUserCount: res.body.guest_user_count,
        });
      })
      .catch((err) => {
        if (err.status === 404) {
          window.canvas.app.$refs.sidebar.$refs.filePanel.setFallbackDoc();
        } else {
          throw err;
        }
      });
  }
  setContents(version, contents) {
    this.activeDocVersion = version;
    this.state.setState(contents || {});
    if (this.isInitialLoad) {
      this.onLoaded();
      this.isInitialLoad = false;
    }
  }
  processTransaction(transaction) {
    if (!this.pendingTransactions[this.activeDocId]) {
      this.pendingTransactions[this.activeDocId] = {
        docId: this.activeDocId,
        transactions: [],
        senderId: this.state.pubSub.getSenderId(),
      };
      setTimeout(
        this.savePendingTransactions.bind(this),
        config.transactionSaveBufferTime
      );
    }
    this.state.pubSub.processTransaction(transaction);
    this.pendingTransactions[this.activeDocId].transactions.push(transaction);
  }
  savePendingTransactions() {
    for (var docId in this.pendingTransactions) {
      // auto-save done this way :
      // httpClient.post(
      //   "docs/process-transaction",
      //   this.pendingTransactions[docId]
      // );
    }
    this.pendingTransactions = {};
  }
  onLoaded() {
    var loadingScreen = document.getElementById("loading-overlay");
    loadingScreen.addEventListener(
      "transitionend",
      () => {
        loadingScreen.remove();
      },
      false
    );
    loadingScreen.classList.add("fade-out");
  }
}
