import UserSettings from "./common/user-settings";
import ErrorReporter from "./tools/error-reporter";
import EventEmitter from "./tools/event-emitter";
import AccountData from "./user/account-data";

export interface AppData {
  view: string;
  hideViewControls: boolean;
}

export interface App {
  data: AppData;

  errorReporter: ErrorReporter;
  userSettings: UserSettings;
  accountData: AccountData;
  eventHub: EventEmitter;

  tick: () => void;
  renderLoop: () => void;
  init(): Promise<App>;
  destroy: () => void;
}
