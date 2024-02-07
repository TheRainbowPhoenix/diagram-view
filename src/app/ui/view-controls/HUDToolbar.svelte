<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { spring } from "svelte/motion";

  import { createToolbar, createDropdownMenu, melt } from "@melt-ui/svelte";
  import Check from "../../../lib/icons/Check.svelte";
  import Box from "../../../lib/icons/Box.svelte";
  import ZoomIn from "../../../lib/icons/ZoomIn.svelte";
  import ZoomScale from "../../../lib/icons/ZoomScale.svelte";
  import ZoomOut from "../../../lib/icons/ZoomOut.svelte";

  import type { App } from "../../types";
  import CONSTANTS from "../../constants";
  import type { AppCtx } from "../../../lib/states/app";

  const appCtx: AppCtx = getContext("root");

  $: app = appCtx.app();

  const zoomOut = () => {
    app.canvas.camera.changeZoomBy(-1);
  };
  const zoomIn = () => {
    app.canvas.camera.changeZoomBy(1);
  };
  const zoomScale = () => {
    app.canvas.camera.setZoom(8);
  };
  const undo = () => {
    app.state.history.undo();
  };
  const redo = () => {
    app.state.history.redo();
  };
  const toggleTopDown = () => {
    app.canvas.camera.toggleTopDown();
  };

  const {
    elements: { root, button, link, separator },
    builders: { createToolbarGroup },
  } = createToolbar();

  const {
    elements: { trigger, menu, item, separator: dpSeparator, arrow },
    builders: { createSubmenu, createMenuRadioGroup, createCheckboxItem },
    states: { open },
  } = createDropdownMenu({
    forceVisible: true,
    loop: true,
    arrowSize: 12,
  });

  let parentElement: HTMLDivElement;

  let left: number = 16;
  let top: number = 16;

  let panelMove = false;
  let panelLastPosition = new Float32Array([0, 0]);
  let customPanelPosition = new Float32Array([0, 0]);
  let hasCustomPosition = false;

  const snappingDistance = 32;
  const bordersPadding = 28;

  let stageSizes = [0, 0];

  let posHudGhost: number[] | null = null;

  let coords;

  const showHudGhost = (
    visible: boolean,
    x?: number,
    y?: number,
    w?: number,
    h?: number
  ) => {
    posHudGhost = visible ? [x, y, w, h] : null;
  };

  const isNearDock = () => {
    return (
      ecDistance(getToolbarPosition(), customPanelPosition) <= snappingDistance
    );
  };

  const setCustomPanelPosition = () => {
    hasCustomPosition = true;
    if (parentElement) {
      customPanelPosition[0] = $coords.x; // parseInt(parentElement.style.left, 16);
      customPanelPosition[1] = $coords.y; // parseInt(parentElement.style.top, 16);
    }
    updateHUDPosition();
  };

  const grabberDown = (e: PointerEvent) => {
    // dipatch event closeAllOverlays
    open.set(false);

    panelMove = true;
    panelLastPosition[0] = e.clientX;
    panelLastPosition[1] = e.clientY;
    setCustomPanelPosition();
    const stageSize = getStageSize();
    if (stageSize && parentElement) {
      const tbPosition = getToolbarPosition();
      const tbX = tbPosition[0];
      const tbY = tbPosition[1];
      const tbWidth = parentElement.clientWidth;
      const tbHeight = parentElement.clientHeight;
      showHudGhost(true, tbX - tbWidth / 2, tbY, tbWidth, tbHeight);
      console.log(true, tbX - tbWidth / 2, tbY, tbWidth, tbHeight);
      // stage.showHudGhost(true, toFArray(tbX - tbWidth / 2, tbY), toFArray(tbWidth, tbHeight));
    }

    const { target: targetElement } = e as any; // TODO
    if (targetElement && targetElement.setPointerCapture) {
      targetElement.setPointerCapture(e.pointerId);
    }
  };

  const grabberMove = (e: PointerEvent) => {
    if (panelMove) {
      const deltaX = e.clientX - panelLastPosition[0];
      const deltaY = e.clientY - panelLastPosition[1];

      panelLastPosition[0] = e.clientX;
      panelLastPosition[1] = e.clientY;

      moveCustomPanelPosition(deltaX, deltaY);
    }
  };

  const grabberUp = (e) => {
    if (panelMove) {
      panelMove = false;

      const { target: targetElement } = e as any; // TODO
      if (targetElement && targetElement.releasePointerCapture) {
        targetElement.releasePointerCapture(e.pointerId);
      }
      if (isNearDock()) {
        clearCustomPanelPosition();
      }
      showHudGhost(false);
      //   stage.showHudGhost(false)
    }
  };

  const toFArray = (x, y) => new Float32Array([x, y]);
  const ecDistance = (point1, point2) => {
    const deltaX = point2[0] - point1[0];
    const deltaY = point2[1] - point1[1];

    return Math.hypot(deltaX, deltaY);
  };

  const moveCustomPanelPosition = (w: number, h: number) => {
    customPanelPosition[0] += w;
    customPanelPosition[1] += h;
    updateHUDPosition();
  };

  const clearCustomPanelPosition = () => {
    hasCustomPosition = false;
    updateHUDPosition();
  };

  const getStageSize = (): number[] => stageSizes; // TODO: store ?

  const getToolbarPosition = () => {
    const stageSize = getStageSize();

    if (stageSize && parentElement) {
      const parentWidth = parentElement.clientWidth;
      const parentHeight = parentElement.clientHeight;

      const halfStageWidth = stageSize[0] / 2;
      const offsetY = stageSize[1] - (parentHeight + bordersPadding);

      let newX = toFArray(halfStageWidth, offsetY)[0];
      let newY = toFArray(halfStageWidth, offsetY)[1];

      if (newX > stageSize[0] - (parentWidth / 2 + bordersPadding)) {
        newX = stageSize[0] - (parentWidth / 2 + bordersPadding);
      }

      if (newX < parentWidth / 2 + bordersPadding) {
        newX = parentWidth / 2 + bordersPadding;
      }

      if (newY < bordersPadding) {
        newY = bordersPadding;
      }

      if (newY > stageSize[1] - (parentHeight + bordersPadding)) {
        newY = stageSize[1] - (parentHeight + bordersPadding);
      }

      return toFArray(newX, newY);
    }
    return toFArray(0, 0);
  };

  const updateHUDPosition = () => {
    const stageSize = getStageSize();

    if (stageSize && parentElement) {
      const parentWidth = parentElement.clientWidth;
      const parentHeight = parentElement.clientHeight;

      const defaultPosition = toFArray(
        stageSize[0] / 2,
        stageSize[1] - (parentHeight + bordersPadding)
      );
      let newX = defaultPosition[0];
      let newY = defaultPosition[1];

      if (hasCustomPosition && !isNearDock()) {
        newX = customPanelPosition[0];
        newY = customPanelPosition[1];
      }

      if (newX > stageSize[0] - (parentWidth / 2 + bordersPadding)) {
        newX = stageSize[0] - (parentWidth / 2 + bordersPadding);
      }

      if (newX < parentWidth / 2 + bordersPadding) {
        newX = parentWidth / 2 + bordersPadding;
      }

      if (newY < bordersPadding) {
        newY = bordersPadding;
      }

      if (newY > stageSize[1] - (parentHeight + bordersPadding)) {
        newY = stageSize[1] - (parentHeight + bordersPadding);
      }

      coords.set({
        x: newX,
        y: newY,
      });

      //   left = newX;
      //   top = newY;
      //   parentElement.style.left = `${newX}px`;
      //   parentElement.style.top = `${newY}px`;
    }
  };

  onMount(() => {
    stageSizes = [
      window.canvas.element.clientWidth,
      window.canvas.element.clientHeight,
    ];
    coords = spring(
      { x: stageSizes[0] / 2, y: stageSizes[1] - bordersPadding * 3 },
      {
        stiffness: 0.2,
        damping: 0.35,
      }
    );
  });
</script>

{#key posHudGhost}
  {#if posHudGhost}
    <div
      class="HUDGhost"
      style="left: {posHudGhost[0]}px; top: {posHudGhost[1]}px; width: {posHudGhost[2]}px; height: {posHudGhost[3]}px;"
    ></div>
  {/if}
{/key}

{#if coords && $coords.x && $coords.y}
  <div
    class="hud-toolbar"
    bind:this={parentElement}
    style="left: {$coords.x}px; top: {$coords.y}px"
  >
    <div class="actions-bar" use:melt={$root}>
      <div
        class="grabber"
        on:pointerdown={grabberDown}
        on:pointermove={grabberMove}
        on:pointerup={grabberUp}
        on:lostpointercapture={grabberUp}
      ></div>
      <div class="container">
        <button
          tabindex="0"
          class="action-button detailed"
          use:melt={$button}
          on:click={toggleTopDown}
        >
          <div class="icon">
            <Box />
          </div>
          <span class="label"> Switch view</span>
        </button>

        <div class="separator" use:melt={$separator} />

        <button class="action-button" use:melt={$button} on:click={zoomIn}>
          <div class="icon">
            <ZoomIn />
          </div>
        </button>

        <button class="action-button" use:melt={$button} on:click={zoomScale}>
          <div class="icon">
            <ZoomScale />
          </div>
        </button>

        <button class="action-button" use:melt={$button} on:click={zoomOut}>
          <div class="icon">
            <ZoomOut />
          </div>
        </button>
        <div class="separator" use:melt={$separator} />

        <button
          class="action-button"
          use:melt={$button}
          use:melt={$trigger}
          aria-label="Update dimensions"
        >
          <span class="label">…</span>
        </button>
        <div class="separator" use:melt={$separator} />

        <button class="action-button" use:melt={$button}>
          <div class="icon">
            <Check />
          </div>
        </button>
      </div>
    </div>
  </div>

  {#if $open}
    <div
      class="menu"
      use:melt={$menu}
      transition:fly={{ duration: 150, y: -10 }}
    >
      <div class="item" use:melt={$item}>Option</div>
      <div class="item" use:melt={$item}>Option too</div>
      <div class="separator" use:melt={$separator} />
      <div class="item" use:melt={$item}>Another Option</div>
      <div use:melt={$arrow} />
    </div>
  {/if}
{/if}

<style lang="postcss">
  .hud-toolbar {
    display: flex;
    position: absolute;
    z-index: 20;

    pointer-events: none;
  }

  .actions-bar {
    --size: 2.75rem; /* 2.5rem */

    display: flex;
    flex-wrap: nowrap;
    filter: drop-shadow(rgba(0, 0, 0, 0.35) 0px 2px 2px);

    background-color: var(--bg-raised); /* --interact */

    height: var(--size, 2.5rem);

    border-radius: 0.625rem; /* 0.5 = 0.25 + 0.5/2 */

    position: relative;
    left: -50%;
    pointer-events: auto;
  }

  .grabber:active {
    cursor: grabbing;
  }

  .grabber {
    padding: 0.375rem 0.75rem 0.375rem 0.375rem;
    align-self: center;
    cursor: grab;
    pointer-events: auto;
    z-index: 10;
  }

  .grabber::before {
    content: "";
    display: block;
    width: 0.25rem;
    height: 1.75rem;
    background-color: var(--border);
    border-radius: 0.25rem;
  }

  .container {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.375rem; /* 0.25rem */
    padding-right: 0.375rem;
  }

  .separator {
    align-self: stretch;
    height: auto;
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;
    min-width: 0.1rem;
    background-color: var(--interact-border);
  }

  .action-button {
    position: relative;
    box-sizing: border-box;
    cursor: pointer;
    display: inline-flex;
    margin: 0px;
    overflow: visible;
    text-decoration: none;
    text-transform: none;
    justify-content: center;
    user-select: none;
    vertical-align: top;

    background-color: transparent;
    color: var(--text-second);
    border-style: solid;
    border-color: transparent;

    line-height: 1.125rem;
    block-size: 2rem; /* 2rem todo: scale to size */
    border-width: 0.05rem;
    border-radius: 0.25rem;

    align-items: center;
    gap: 0.75rem;
    min-inline-size: 2rem; /* 2rem todo: scale to size */
    /* padding-inline: 0.75rem; */

    transition:
      border-color 0.25s ease-in-out,
      background-color 0.25s ease-in-out;
  }

  .action-button:hover {
    background-color: var(--interact-border);
    color: var(--text-main);
  }

  .action-button.detailed {
    background-color: var(--bg-darker);
    border-color: var(--border);
    padding-inline: 0.75rem;
  }
  .action-button.detailed:hover {
    background-color: var(--interact);
  }

  .action-button .icon {
    display: inline-flex;
    margin-inline-end: -0.375rem;
    margin-inline-start: -0.375rem;
    flex-shrink: 0;
  }

  .action-button .icon :global(svg) {
    width: 1.5rem; /* 1.125 */
    height: 1.5rem;
  }

  .action-button .icon :global(svg .ico-line) {
    fill: currentColor;
    opacity: 0.2;
    backdrop-filter: blur(3px);
    box-shadow:
      inset -1px 0 1px rgb(255 255 255 / 6%),
      inset 0 0 8px rgba(255, 255, 255, 0.04);
    transition: all 400ms ease;
  }
  .action-button:hover .icon :global(svg .ico-solid) {
    fill: var(--accent);
    box-shadow: 0 0 3px var(--accent);
    transition: all 400ms ease;
  }

  .action-button .label {
    align-items: center;
    color: var(--text-second);
    cursor: pointer;
    font-size: 0.875rem;
    justify-self: center;
    list-style: 1.125rem;
    overflow: hidden;
    pointer-events: none;
    text-align: start;
    text-overflow: ellipsis;
    text-wrap: nowrap;
    user-select: none;
    white-space-collapse: collapse;
  }

  .HUDGhost {
    position: absolute;
    background-color: var(--text-second);
    box-shadow: inset 0px 0px 0 0.125rem var(--border);

    /* border: 0.125rem solid var(--text-main); */
    opacity: 0.15;
    border-radius: 0.625rem;
  }

  /* TODO: move to global / ctor */
  .menu {
    z-index: 2000;
    display: flex;
    max-height: 600px;
    min-width: 220px;
    flex-direction: column;
    box-shadow:
      rgb(255, 255, 255) 0px 0px 0px 0px,
      rgba(59, 130, 246, 0.5) 0px 0px 0px 0px,
      rgba(23, 23, 23, 0.3) 0px 10px 15px -3px,
      rgba(23, 23, 23, 0.3) 0px 4px 6px -4px;
    border-radius: 0.375rem;
    padding: 0.25rem;
    outline: 1px solid var(--interact-border);
    background-color: var(--bg-raised);
  }

  .menu .separator {
    margin: 5px;
    height: min(0.06rem, 1px);
    background-color: rgb(45, 45, 45);
  }

  .menu .item {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    line-height: 1.25rem;
    line-height: 1;
    position: relative;
    height: 1.5rem;
    min-height: 24px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    border-radius: 0.125rem;
    padding-left: 1.5rem;
    padding-right: 0.25rem;
    z-index: 2000;
    color: var(--text);
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow:
      rgb(255, 255, 255) 0px 0px 0px 0px,
      rgba(59, 130, 246, 0.5) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px;
  }
</style>
