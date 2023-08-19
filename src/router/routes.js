import Home from "../pages/Home.svelte";
import Map from "../pages/Map.svelte";

export const routes = [
  {
    name: "Home",
    url: "/",
    component: Home,
  },
  {
    name: "Map",
    url: "/map",
    component: Map,
  },
];
