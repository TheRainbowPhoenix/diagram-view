<script>
  import * as THREE from "three";
  import { onMount, onDestroy } from "svelte";

  import { mount } from "../app";
  import ViewControls from "../app/ui/view-controls/ViewControls.svelte";

  /** @type {HTMLCanvasElement} */
  let canvas;

  /** @type {HTMLDivElement} */
  let root;

  /** @type {import('../app/types').App} */
  let app;

  let loop = true;

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
      if (loop) {
        window.requestAnimationFrame(tick);
      }
    };

    tick();
  });

  onDestroy(() => {
    loop = false;
    if (app) {
      app.destroy();
    }
  });
</script>

<div class="app-wrapper">
  <div id="root" bind:this={root}>
    {#if loading}
      <p>Loading ...</p>
    {/if}
    <!-- <canvas id="map" bind:this={canvas} /> -->
  </div>
  {#if !loading}
    <ViewControls bind:app />
  {/if}
</div>

<style>
  #root {
    overflow: hidden;
    border-radius: 22px;
  }

  .app-wrapper {
    margin-top: 2em;
    position: relative;
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
