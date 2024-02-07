<script>
  import * as THREE from "three";
  import { onMount, onDestroy, setContext, tick, afterUpdate } from "svelte";

  import { mount } from "../app";
  import ViewControls from "../app/ui/view-controls/ViewControls.svelte";
  import BaseViewControls from "../app/ui/view-controls/BaseViewControls.svelte";
  import { explorerVisible, toolbarVisible } from "../lib/states/ui";
  import Toolbar from "../app/ui/Toolbar.svelte";
  import TitleBar from "../lib/TitleBar.svelte";
  import {
    appThemeName,
    appThemeClass,
    appThemeColors,
  } from "../lib/states/themes";
  import HudToolbar from "../app/ui/view-controls/HUDToolbar.svelte";

  /** @type {HTMLCanvasElement} */
  let canvas;

  /** @type {HTMLButtonElement} */
  let root;

  /** @type {import('../app/types').App} */
  let app;

  let loop = true;

  const sizes = {
    width: 800,
    height: 600,
  };

  let loading = true;

  let repaintFlag = false;

  explorerVisible.subscribe((v) => {
    repaintFlag = true;
  });

  toolbarVisible.subscribe((v) => {
    repaintFlag = true;
  });

  setContext("root", {
    app: () => app,
  });

  const toggleSB = () => {
    explorerVisible.update((v) => !v);
    // repaintFlag = true;
  };

  // const toggleTB = () => {
  //   toolbarVisible.update((v) => !v);
  //   repaintFlag = true;
  // };

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

  let htmlStyle = "";

  appThemeColors.subscribe((c) => {
    const colorVars = Object.entries(c).map(
      ([key, value]) => `--${key}: ${value};`
    );
    htmlStyle = `<style>:root { ${colorVars.join("  ")} }</style>`;
  });
</script>

<div class="theme-root">
  {@html htmlStyle}

  <TitleBar />

  <div class="app-wrapper">
    <div class="left-taskbar" class:visible={$toolbarVisible}>
      <Toolbar />
    </div>
    <div class="main-space">
      <button
        on:click|preventDefault={() => {
          root.focus();
        }}
        id="root"
        tabindex="0"
        bind:this={root}
        class:sidebarVisible={$explorerVisible}
        class:toolbarVisible={$toolbarVisible}
      >
        {#if loading}
          <p>Loading ...</p>
          <div id="loading-overlay"></div>
        {/if}
        <!-- <canvas id="map" bind:this={canvas} /> -->
      </button>
      {#if !loading}
        <HudToolbar />
        <!-- <ViewControls /> -->
      {/if}
      <button class="SB" on:click={toggleSB}>SB</button>
      <!-- <button class="TB" on:click={toggleTB}>TB</button> -->
    </div>
    <div class="sidebar" class:visible={$explorerVisible}>
      <p style="margin: 1rem;">Explorer</p>
    </div>
  </div>
</div>

<style>
  .theme-root {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  /* button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
  }
  button:hover {
    border-color: #646cff;
  } */

  #root {
    position: absolute;
    inset: 0;
    overflow: hidden;
    /* border-radius: 22px 22px 0 0; */
    height: 100%;
    width: 100%;
    outline: transparent;
    cursor: initial !important;
    background-color: var(--grid-bg);
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
    margin: 0 0.5rem;
    background-color: var(--bg-raised);
    transition: background-color 0.2s ease-in-out;
  }

  .TB {
    position: absolute;
    top: 11px;
    left: 11px;
  }

  .left-taskbar {
    position: relative;
    display: flex;
    visibility: hidden;
    overflow: hidden;
    flex: 0 0 0px;
  }

  .left-taskbar.visible {
    visibility: visible;
    flex: 0 0 32px;

    padding: 8px;
  }

  .left-taskbar.visible ~ .main-space #root:focus::before {
    content: "";
    margin-top: 22px;
    position: absolute;
    z-index: 10;
    width: 1.5px;
    height: 100%;
    top: 0;
    bottom: 0;
    left: 0px;
    --bg-color: rgba(255, 255, 255, 0.05);
    background-image: linear-gradient(
      45deg,
      transparent 0%,
      var(--bg-color) 40%,
      var(--bg-color) 90%,
      transparent 100%,
      transparent
    );
    backdrop-filter: blur(12px);
  }
</style>
