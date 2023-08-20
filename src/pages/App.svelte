<script>
  import * as THREE from "three";
  import { onMount } from "svelte";

  import { mount } from "../app";

  /** @type {HTMLCanvasElement} */
  let canvas;

  /** @type {HTMLDivElement} */
  let root;

  /** @type {import('../app/types').App} */
  let app;

  const sizes = {
    width: 800,
    height: 600,
  };

  let loading = true;

  onMount(async () => {
    console.log("--- Root mounted !");

    // const data_rep = await fetch("/data.json");
    // const data = await data_rep.json();
    // const settings = data.settings || {};

    // console.log(settings);
    // app.userSettings.setAll(settings)
    app = mount(root);
    console.log("--- App mounted");

    await app.init();
    console.log("--- App init OK");

    loading = false;

    // Animate
    const clock = new THREE.Clock();
    let lastElapsedTime = 0;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - lastElapsedTime;
      lastElapsedTime = elapsedTime;

      app.tick();

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();
  });
</script>

<div id="root" bind:this={root}>
  {#if loading}
    <p>Loading ...</p>
  {/if}
  <!-- <canvas id="map" bind:this={canvas} /> -->
</div>

<style>
  #root {
    overflow: hidden;
  }

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
