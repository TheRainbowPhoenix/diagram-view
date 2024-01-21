import { Canvas } from "./canvas/canvas";
import UserSettings from "./common/user-settings";
import ObjectCreator from "./obj/object-creator";
import ObjectFinder from "./obj/object-finder";
import ObjectRegistry from "./obj/object-registry";
import { State } from "./state/state";
import ErrorReporter from "./tools/error-reporter";
import EventEmitter from "./tools/event-emitter";
import InteractionMode from "./tools/interaction-mode";
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

  canvas: Canvas;
  objects: ObjectRegistry;
  state: State;
  objectCreator: ObjectCreator;
  interactionMode: InteractionMode;
  objectFinder: ObjectFinder;

  tick: () => void;
  renderLoop: () => void;
  init(): Promise<App>;
  destroy: () => void;
}
