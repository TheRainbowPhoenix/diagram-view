<script lang="ts">
  import { createMenubar, melt } from "@melt-ui/svelte";
  import { writable } from "svelte/store";
  import ChevronRight from "./icons/ChevronRight.svelte";
  import Check from "./icons/Check.svelte";
  import { locale, locales, t } from "./helpers/i18n";
  import {
    explorerVisible,
    helperUI,
    tipsAndTricks,
    toolbarVisible,
  } from "./states/ui";
  import CONSTANTS from "../app/constants";
  import { getContext, onMount } from "svelte";
  import type { AppCtx } from "./states/app";
  import { appThemeName, availableThemes } from "./states/themes";
  import AboutDialog from "./dialogs/AboutDialog.svelte";
  //   import { ChevronRight, Check } from "lucide-svelte";

  const appCtx: AppCtx = getContext("root");

  const app = () => {
    return appCtx.app();
  };

  const zoomOut = () => {
    app() && app().canvas.camera.changeZoomBy(-1);
  };
  const zoomIn = () => {
    app() && app().canvas.camera.changeZoomBy(1);
  };

  const undo = () => {
    app() && app().state.history.undo();
  };
  const redo = () => {
    app() && app().state.history.redo();
  };

  const redraw = () => {
    app() && app().canvas.camera.setZoom(8);
    app() && app().canvas.onResize();
  };

  const doBugReport = () => {
    window.open(
      "https://github.com/TheRainbowPhoenix/diagram-view/issues",
      "_blank"
    );
  };

  const requestFullscreen = () => {
    document.documentElement.requestFullscreen();
  };

  const goZen = () => {
    explorerVisible.set(false);
    toolbarVisible.set(false);
  };

  const rotateLeft = () => {
    app() && app().canvas.camera.rotateLeft();
  };

  const rotateRight = () => {
    app() && app().canvas.camera.rotateRight();
  };

  const switch3D = () => {
    app() && app().canvas.camera.toggleTopDown();
  };

  const themesArr = availableThemes.map((t) => t.name);

  const {
    elements: { menubar },
    builders: { createMenu },
  } = createMenubar();

  const {
    elements: { trigger, menu, item, separator },
    builders: { createSubmenu, createMenuRadioGroup },
  } = createMenu();

  const {
    elements: { subMenu, subTrigger },
  } = createSubmenu();

  const {
    elements: { radioGroup, radioItem },
    helpers: { isChecked },
  } = createMenuRadioGroup({
    defaultValue: themesArr[0],
    onValueChange: ({ curr, next }) => {
      appThemeName.set(next);
      return next;
    },
  });

  const {
    elements: { subMenu: lngSubMenu, subTrigger: lngSubTrigger },
  } = createSubmenu();

  const {
    elements: { radioGroup: lngRadioGroup, radioItem: lngRadioItem },
    helpers: { isChecked: lngIsChecked },
  } = createMenuRadioGroup({
    defaultValue: $locale,
    onValueChange: ({ curr, next }) => {
      locale.set(next);
      return next;
    },
  });

  const {
    elements: {
      trigger: triggerA,
      menu: menuA,
      item: itemA,
      separator: separatorA,
    },
    builders: {
      createSubmenu: createSubmenuEdit,
      createMenuRadioGroup: createMenuRadioGroupEdit,
    },
  } = createMenu();

  const {
    elements: {
      trigger: triggerB,
      menu: menuB,
      item: itemB,
      separator: separatorB,
    },
    builders: {
      createSubmenu: createSubmenuB,
      createCheckboxItem: createCheckboxItemB,
    },
  } = createMenu();

  const {
    elements: { checkboxItem: explorerVisibleCheckbox },
  } = createCheckboxItemB({
    checked: explorerVisible,
  });

  const {
    elements: { checkboxItem: toolbarVisibleCheckbox },
  } = createCheckboxItemB({
    checked: toolbarVisible,
  });

  const availableInteractionModes = [
    // CONSTANTS.INTERACTION_MODE.PAN,
    CONSTANTS.INTERACTION_MODE.PAN_ON_DRAG,
    CONSTANTS.INTERACTION_MODE.SELECT,
  ];

  const setInteractionMode = (ir: string) => {
    app().interactionMode.set(ir);
  };

  const {
    elements: { radioGroup: interactRdGroup, radioItem: interactRdItem },
    helpers: { isChecked: isInteractMode },
  } = createMenuRadioGroupEdit({
    defaultValue: CONSTANTS.INTERACTION_MODE.SELECT,
    onValueChange: ({ curr, next }) => {
      setInteractionMode(next);
      return next;
    },
  });

  const {
    elements: { subMenu: subMenuEdit, subTrigger: subTriggerEdit },
  } = createSubmenuEdit();

  const {
    elements: { subMenu: subMenuB, subTrigger: subTriggerB },
  } = createSubmenuB();

  const {
    elements: {
      trigger: triggerC,
      menu: menuC,
      item: itemC,
      separator: separatorC,
    },
    builders: { createCheckboxItem: createCheckboxItemC },
  } = createMenu();

  const {
    elements: { checkboxItem: tipsAndTricksCheckbox },
  } = createCheckboxItemC({
    checked: tipsAndTricks,
  });

  const {
    elements: { checkboxItem: helperUICheckbox },
  } = createCheckboxItemC({
    checked: helperUI,
  });

  let aboutDlgVisible;

  const showAboutDlg = () => {
    aboutDlgVisible && aboutDlgVisible.set(true);
  };
</script>

<div class="dialogs-portals">
  <AboutDialog bind:visible={aboutDlgVisible} />
</div>

<div class="menubar" use:melt={$menubar}>
  <!------------>
  <!--- FILE --->
  <!------------>
  <button
    type="button"
    class="trigger"
    use:melt={$trigger}
    aria-label="Update dimensions"
  >
    {$t("menu.file")}
  </button>

  <div class="menu" use:melt={$menu}>
    <div class="item" use:melt={$item}>
      {$t("menu.file.new")}
      <div class="rightSlot">⌘T</div>
    </div>
    <div class="item" use:melt={$item} data-disabled>
      {$t("menu.file.newWindow")}
      <div class="rightSlot">⇧⌘T</div>
    </div>
    <div class="separator" use:melt={$separator} />
    <div class="item" use:melt={$subTrigger}>
      {$t("menu.file.selectTheme")}
      <div class="rightSlot">
        <ChevronRight />
      </div>
    </div>
    <div class="menu subMenu" use:melt={$subMenu}>
      <div use:melt={$radioGroup}>
        {#each themesArr as theme}
          <div class="item" use:melt={$radioItem({ value: theme })}>
            <div class="check">
              {#if $isChecked(theme)}
                <div class="dot" />
              {/if}
            </div>
            {theme}
          </div>
        {/each}
      </div>
    </div>
    <div class="item" use:melt={$lngSubTrigger}>
      {$t("menu.file.selectLang")}
      <div class="rightSlot">
        <ChevronRight />
      </div>
    </div>
    <div class="menu subMenu" use:melt={$lngSubMenu}>
      <div use:melt={$lngRadioGroup}>
        {#each locales as lng}
          <div class="item" use:melt={$lngRadioItem({ value: lng })}>
            <div class="check">
              {#if $lngIsChecked(lng)}
                <div class="dot" />
              {/if}
            </div>
            {lng}
          </div>
        {/each}
      </div>
    </div>
    <div use:melt={$separator} class="separator" />
    <div class="item" use:melt={$item}>
      {$t("menu.file.quit")}
      <div class="rightSlot">⌘Q</div>
    </div>
  </div>

  <!------------>
  <!--- EDIT --->
  <!------------>
  <button
    type="button"
    class="trigger"
    use:melt={$triggerA}
    aria-label="Update dimensions"
  >
    {$t("menu.edit")}
  </button>

  <div class="menu" use:melt={$menuA}>
    <div class="item" use:melt={$itemA} on:m-click={undo}>
      Undo
      <div class="rightSlot">⌘Z</div>
    </div>
    <div class="item" use:melt={$itemA} on:m-click={redo}>
      Redo
      <div class="rightSlot">⇧⌘Z</div>
    </div>
    <div class="separator" use:melt={$separatorA} />
    <div class="item" use:melt={$itemA}>
      Cut
      <div class="rightSlot">⌘X</div>
    </div>
    <div class="item" use:melt={$itemA}>
      Copy
      <div class="rightSlot">⌘C</div>
    </div>
    <div class="item" use:melt={$itemA}>
      Paste
      <div class="rightSlot">⌘V</div>
    </div>

    <div use:melt={$separatorA} class="separator" />

    <div class="item" use:melt={$itemA}>
      Find
      <div class="rightSlot">⌘F</div>
    </div>
    <div class="item" use:melt={$itemA}>
      Replace
      <div class="rightSlot">⌥⌘F</div>
    </div>
    <div use:melt={$separatorA} class="separator" />

    <div class="item" use:melt={$subTriggerEdit}>
      Interaction Mode
      <div class="rightSlot">
        <ChevronRight />
      </div>
    </div>
    <div class="menu subMenu" use:melt={$subMenuEdit}>
      <div use:melt={$interactRdGroup}>
        {#each availableInteractionModes as intMode}
          <div class="item" use:melt={$interactRdItem({ value: intMode })}>
            <div class="check">
              {#if $isInteractMode(intMode)}
                <div class="dot" />
              {/if}
            </div>
            {intMode}
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!------------>
  <!--- VIEW --->
  <!------------>
  <button
    type="button"
    class="trigger"
    use:melt={$triggerB}
    aria-label="Update dimensions"
  >
    {$t("menu.view")}
  </button>

  <div class="menu" use:melt={$menuB}>
    <div class="item" use:melt={$itemB}>
      Command Palette..
      <div class="rightSlot">⇧⌘P</div>
    </div>

    <div class="item" use:melt={$itemB}>Open View...</div>
    <div class="separator" use:melt={$separatorB} />
    <div class="item" use:melt={$subTriggerB}>
      Appearance
      <div class="rightSlot">
        <ChevronRight />
      </div>
    </div>
    <div class="menu subMenu" use:melt={$subMenuB}>
      <div use:melt={$radioGroup}>
        <div class="item" use:melt={$itemB} on:m-click={requestFullscreen}>
          Full Screen
        </div>
        <div class="item" use:melt={$itemB} on:m-click={goZen}>Zen Mode</div>
      </div>
    </div>
    <div class="separator" use:melt={$separatorB} />
    <!-- TODO : all in camera ? -->

    <div class="item" use:melt={$itemB} on:m-click={zoomIn}>Zoom In</div>
    <div class="item" use:melt={$itemB} on:m-click={zoomOut}>Zoom Out</div>
    <div class="item" use:melt={$itemB} on:m-click={redraw}>Reset Zoom</div>

    <div class="separator" use:melt={$separatorB} />

    <div class="item" use:melt={$itemB} on:m-click={rotateLeft}>
      Rotate Left
      <div class="rightSlot">E</div>
    </div>
    <div class="item" use:melt={$itemB} on:m-click={rotateRight}>
      Rotate Right
      <div class="rightSlot">Q</div>
    </div>
    <div class="item" use:melt={$itemB} on:m-click={switch3D}>
      Toggle 2D/3D
      <div class="rightSlot">X</div>
    </div>

    <div class="separator" use:melt={$separatorB} />

    <div class="item" use:melt={$explorerVisibleCheckbox}>
      <div class="check">
        {#if $explorerVisible}
          <Check />
        {/if}
      </div>
      Explorer
      <div class="rightSlot">⌘E</div>
    </div>
    <div class="item" use:melt={$toolbarVisibleCheckbox}>
      <div class="check">
        {#if $toolbarVisible}
          <Check />
        {/if}
      </div>
      Toolbar
      <div class="rightSlot">⌘T</div>
    </div>
  </div>

  <!------------>
  <!--- HELP --->
  <!------------>
  <button
    type="button"
    class="trigger"
    use:melt={$triggerC}
    aria-label="Update dimensions"
  >
    {$t("menu.help")}
  </button>

  <div class="menu" use:melt={$menuC}>
    <div class="item" use:melt={$itemC} on:m-click={showAboutDlg}>
      About WhirlWind
    </div>
    <div class="item" use:melt={$itemC}>Check for Updates...</div>
    <div class="separator" use:melt={$separatorC} />
    <div class="item" use:melt={$tipsAndTricksCheckbox}>
      <div class="check">
        {#if $tipsAndTricks}
          <Check />
        {/if}
      </div>
      Tips & Tricks
    </div>

    <div use:melt={$separatorC} class="separator" />

    <div class="item" use:melt={$helperUICheckbox}>
      <div class="check">
        {#if $helperUI}
          <Check />
        {/if}
      </div>
      Documentation
    </div>
    <div class="item" use:melt={$itemC} data-disabled>
      Show All Components
      <div class="rightSlot">⇧⌘N</div>
    </div>
    <div use:melt={$separatorC} class="separator" />
    <div class="item" use:melt={$itemC} on:m-click={doBugReport}>
      Report a bug...
    </div>
  </div>
</div>

<style lang="postcss">
  *:not(body) {
    outline: none;
    user-select: none;
  }

  .menubar {
    display: flex;
    border-radius: 0.375rem;
    padding: 0.25rem;
  }

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

  .subMenu {
    min-width: 220px;
    box-shadow:
      rgb(255, 255, 255) 0px 0px 0px 0px,
      rgba(59, 130, 246, 0.5) 0px 0px 0px 0px,
      rgba(23, 23, 23, 0.3) 0px 10px 15px -3px,
      rgba(23, 23, 23, 0.3) 0px 4px 6px -4px;
  }

  .item {
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

    /* @apply relative h-6 min-h-[24px] select-none rounded-sm pl-6 pr-1;
    @apply z-20 text-magnum-900 outline-none;
    @apply data-[highlighted]:bg-magnum-200 data-[highlighted]:text-magnum-900;
    @apply data-[disabled]:text-neutral-300;
    @apply flex items-center text-sm leading-none;
    @apply cursor-default ring-0 !important; */
  }

  .item:hover,
  :global(.item[data-highlighted]) {
    background-color: var(--accent); /* 200 */
    color: rgba(23, 23, 23); /* 900 */
    cursor: pointer; /* replicating VS Code behaviour */
  }

  .item[data-disabled] {
    color: rgba(125, 125, 125); /* 300 */
  }

  .item[data-disabled]:hover,
  :global(.item[data-highlighted][data-disabled]) {
    background-color: hsla(0, 0%, 100%, 15.81%);
    cursor: initial; /* replicating VS Code behaviour */
  }

  .trigger {
    cursor: default !important;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;
    line-height: 1;

    overflow: visible !important;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;

    background-color: transparent;

    padding: 0.5rem 0.75rem;
    color: var(--text-second); /* 900 */
    transition-property: color, background-color, border-color,
      text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 0.15s;
  }

  .trigger:hover,
  .trigger:focus {
    background-color: var(--interact);
  }

  .trigger[data-highlighted] {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  .trigger[data-highlighted] {
    /* --tw-bg-opacity: 1 !important; */
    background-color: var(--interact-border);
    /* rgb(var(--color-magnum-200) / var(--tw-bg-opacity))!important; */
    --tw-ring-opacity: 1 !important;
    --tw-ring-color: rgb(
      var(--color-magnum-400) / var(--tw-ring-opacity)
    ) !important
;
  }

  .trigger:focus {
    z-index: 30;
    /* box-shadow:
      rgb(255, 255, 255) 0px 0px 0px 0px,
      rgb(247, 177, 85) 0px 0px 0px 3px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px; */
  }

  /* .trigger {
    @apply inline-flex items-center justify-center rounded-md bg-white px-3 py-2;
    @apply text-magnum-900 transition-colors hover:bg-white/90 data-[highlighted]:outline-none;
    @apply overflow-visible data-[highlighted]:bg-magnum-200 data-[highlighted]:ring-magnum-400 !important;
    @apply !cursor-default text-sm font-medium leading-none focus:z-30 focus:ring;
  } */

  .check {
    position: absolute;
    left: 0.5rem;
    top: 50%;
    color: var(--accent-check); /* 500 */
    translate: 0 calc(-50% + 1px);
  }

  .item:hover .check,
  :global(.item[data-highlighted]) .check {
    color: rgba(23, 23, 23);
  }

  /* .check {
    @apply absolute left-2 top-1/2 text-magnum-500;
    translate: 0 calc(-50% + 1px);
  } */

  .dot {
    height: 4.75px;
    width: 4.75px;
    border-radius: 8px;
    background-color: var(--accent-check); /* 900 */
  }

  .item:hover .dot,
  :global(.item[data-highlighted]) .dot {
    background-color: rgba(23, 23, 23);
  }

  /* .dot {
    @apply h-[4.75px] w-[4.75px] rounded-full bg-magnum-900;
  } */

  .separator {
    margin: 5px;
    height: min(0.06rem, 1px); /* HiDPI fix */

    background-color: rgb(45, 45, 45); /* 200 */
  }

  /* .separator {
    @apply m-[5px] h-[1px] bg-magnum-200;
  } */

  .rightSlot {
    margin-left: auto;
    padding-left: 1.25rem;
  }

  /* .rightSlot {
    @apply ml-auto pl-5;
  } */

  .check {
    position: absolute;
    left: 0;
    display: inline-flex;
    width: 1.5rem;
    align-items: center;
    justify-content: center;
  }

  /* .check {
    @apply absolute left-0 inline-flex w-6 items-center justify-center;
  } */

  .text {
    padding-left: 1.5rem;
    font-size: 0.75rem;
    line-height: 1.5rem;
    color: rgb(178, 178, 178); /* 600 */
  }
  /* .text {
    @apply pl-6 text-xs leading-6 text-neutral-600;
  } */
</style>
