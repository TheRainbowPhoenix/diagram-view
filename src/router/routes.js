import App from "../pages/App.svelte";
import Home from "../pages/Home.svelte";
import Map from "../pages/Map.svelte";

export const routes = [
  {
    name: "App",
    url: "/",
    component: App,
  },
  {
    name: "Text",
    url: "/text",
    component: Home,
  },
  {
    name: "Map",
    url: "/map",
    component: Map,
  },
];
