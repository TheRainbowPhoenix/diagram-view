const TRANSACTION_EVENT = "transactions";
const TRANSACTION_EVENT_CLIENT = "client-transactions";

import config from "../config";
import * as tools from "../tools/tools";

export default class PubSub {
  constructor(app) {
    this.app = app;
    this.channel = null;
    this.pusherClient = null;
    this.onTransactionsFn = this.onTransactions.bind(this);
    this.publishBuffer = [];
    this.publishTimeout = null;
    this.lastPublishTime = 0;
    this.publishBufferedTransactionsFn =
      this.publishBufferedTransactions.bind(this);
    if (window.Pusher) {
      this.app.$on("init", this.createPusherClient.bind(this));
    }
  }
  createPusherClient() {
    var connectionParams = {
      cluster: "eu",
      encrypted: true,
    };
    if (this.app.isLiveEmbed) {
      (connectionParams.authEndpoint =
        config.httpRoot + "account/pusher-channel-auth-live-embed"),
        (connectionParams.auth = {
          params: {
            live_embed_key: tools.getQueryParam("key"),
          },
        });
    } else {
      connectionParams.authEndpoint =
        config.httpRoot + "account/pusher-channel-auth";
    }
    this.pusherClient = new window.Pusher(
      "197fb21b3575cb3d1ae9",
      connectionParams
    );
    this.bindToDocChannel();
    this.bindToUserChannel();
    this.app.userSettings.on(
      "lastActiveDocIdchanged",
      this.bindToDocChannel,
      this
    );
  }
  bindToUserChannel() {
    const userId = this.app.accountData.get("userId");
    const userChannel = this.pusherClient.subscribe("private-user-" + userId);
    userChannel.bind("notification", (data) => {
      this.app.eventHub.emit(data.type, data);
    });
    userChannel.bind("pusher:subscription_succeeded", (a, b, c) => {});
    userChannel.bind("pusher:subscription_error", (a, b, c) => {});
  }
  bindToDocChannel() {
    const docId = this.app.userSettings.get("lastActiveDocId");
    if (!docId) {
      return;
    }
    if (this.channel) {
      this.channel.unbind(TRANSACTION_EVENT, this.onTransactionsFn);
      this.channel.unbind(TRANSACTION_EVENT_CLIENT, this.onTransactionsFn);
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.channel = this.pusherClient.subscribe("private-" + docId);
    this.channel.bind(TRANSACTION_EVENT, this.onTransactionsFn);
    this.channel.bind(TRANSACTION_EVENT_CLIENT, this.onTransactionsFn);
    this.channel.bind("pusher:subscription_succeeded", (a, b, c) => {});
    this.channel.bind("pusher:subscription_error", (a, b, c) => {
      const msg = `\n                You are not authorized to access the document with id ${docId} - \n                if you feel that this is an error, please email info@arcentry.com.\n                Clicking OK will take you to a fallback`;
      window.canvas.app.$refs.fullscreenOverlay.showError(
        "Access to document not authorized",
        msg,
        () => {
          window.canvas.app.$refs.sidebar.$refs.filePanel.setFallbackDoc();
        }
      );
    });
  }
  onTransactions(transactions) {
    for (var i = 0; i < transactions.length; i++) {
      transactions[i].isTransient = true;
      this.app.state.processTransaction(transactions[i], true, true);
    }
  }
  processTransaction(transaction) {
    const hasListeners =
      this.app.state.meta.docMeta.liveEmbedEnabled ||
      this.app.state.meta.docMeta.guestUserCount;
    if (!hasListeners) {
      return;
    }
    this.publishBuffer.push(transaction);
    if (this.publishTimeout) {
      return;
    }
    const timeout = Date.now() - this.lastPublishTime > 100 ? 0 : 104;
    this.publishTimeout = setTimeout(
      this.publishBufferedTransactionsFn,
      timeout
    );
  }
  publishBufferedTransactions() {
    this.channel.trigger(TRANSACTION_EVENT_CLIENT, this.publishBuffer);
    this.publishBuffer = [];
    this.publishTimeout = null;
    this.lastPublishTime = Date.now();
  }
  getSenderId() {
    //TODO: kill pusher
    return "1337";
    // return this.pusherClient.connection.socket_id;
  }
}
