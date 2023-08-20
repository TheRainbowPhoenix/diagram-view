<script>
  import * as THREE from "three";
  import { onMount } from "svelte";

  import { mount } from "../app";

  /** @type {HTMLCanvasElement} */
  let canvas;

  /** @type {import('../app/types').App} */
  let app;

  const sizes = {
    width: 800,
    height: 600,
  };

  onMount(async () => {
    console.log("mounted !", canvas);

    const data_rep = await fetch("/data.json");

    const data = await data_rep.json();

    const settings = data.settings || {};

    console.log(settings);
    // app.userSettings.setAll(settings)
    app = mount();
  });
</script>

<canvas id="map" bind:this={canvas} />

<style>
  canvas {
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 800px;
    min-height: 600px;
    mix-blend-mode: color-dodge;
    background: var(--noise);
    background-size: 140px, 100%, cover;
    background-blend-mode: exclusion;
    background-position: 0% 100%;
    background-color: dimgray;
  }
</style>
