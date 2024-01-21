<script>
  import * as THREE from "three";
  import { onMount, onDestroy, setContext, tick, afterUpdate } from "svelte";

  import { mount } from "../app";
  import ViewControls from "../app/ui/view-controls/ViewControls.svelte";
  import BaseViewControls from "../app/ui/view-controls/BaseViewControls.svelte";

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

  let sidebarVisible = false;
  let toolbarVisible = false;
  let repaintFlag = false;

  setContext("root", {
    app: () => app,
  });

  const toggleSB = () => {
    sidebarVisible = !sidebarVisible;
    repaintFlag = true;
  };

  const toggleTB = () => {
    toolbarVisible = !toolbarVisible;
    repaintFlag = true;
  };

  afterUpdate(() => {
    if (repaintFlag) {
      repaintFlag = false;
      app.canvas.onResize();
    }
  });

  onMount(async () => {
    console.log("--- Root mounted !");

    // console.log(root.getBoundingClientRect());

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
  <div class="toolbar" class:visible={toolbarVisible}>
    <p>TODO</p>
  </div>
  <div class="main-space">
    <div id="root" bind:this={root} class:sidebarVisible class:toolbarVisible>
      {#if loading}
        <p>Loading ...</p>
        <div id="loading-overlay"></div>
      {/if}
      <!-- <canvas id="map" bind:this={canvas} /> -->
    </div>
    {#if !loading}
      <ViewControls />
    {/if}
    <button class="SB" on:click={toggleSB}>SB</button>
    <button class="TB" on:click={toggleTB}>TB</button>
  </div>
  <div class="sidebar" class:visible={sidebarVisible}>
    <p style="margin: 1rem;">TODO</p>
  </div>
</div>

<style>
  #root {
    overflow: hidden;
    /* border-radius: 22px 22px 0 0; */
    height: 100%;
    width: 100%;
  }

  #root.sidebarVisible {
    border-top-right-radius: 22px;
  }

  #root.toolbarVisible {
    border-top-left-radius: 22px;
  }

  .app-wrapper {
    height: 100%;
    width: 100%;
    display: flex;
    /* margin-top: 2em; */
  }

  .main-space {
    position: relative;
    flex: 1 1 100%;
    overflow: hidden;
  }

  .SB {
    position: absolute;
    top: 11px;
    right: 11px;
  }

  .sidebar {
    border-radius: 22px 22px 0 0;
    visibility: hidden;
    overflow: hidden;
    flex: 0 0 0px;
  }

  .sidebar.visible {
    visibility: visible;
    flex: 0 0 250px;
    margin: 0 1rem;
    background-color: #131416;
    transition: background-color 0.2s ease-in-out;
  }

  .TB {
    position: absolute;
    top: 11px;
    left: 11px;
  }

  .toolbar {
    visibility: hidden;
    overflow: hidden;
    flex: 0 0 0px;
  }

  .toolbar.visible {
    visibility: visible;
    flex: 0 0 48px;
    margin: 0 1rem;
  }
  /* 
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
  } */
</style>
