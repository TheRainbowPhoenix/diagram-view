import { getContext } from "svelte";
import { App } from "../../app/types";

export interface AppCtx {
  app: () => App;
}
