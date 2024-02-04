<script>
  import MainMenu from "./MainMenu.svelte";

  import AppIcon from "./icons/AppIcon.svelte";
</script>

<div class="titlebar">
  <div class="titlebar-menu">
    <div class="appicon">
      <AppIcon />
    </div>
    <MainMenu />
  </div>

  <!-- If CSD -->
  <div class="window-controls">
    <div class="win-ico win-min"></div>
    <div class="win-ico win-restore"></div>
    <div class="win-ico win-close"></div>
  </div>
</div>

<style>
  * {
    margin: 0;
    padding: 0;
  }

  .titlebar {
    display: flex;
    flex-direction: row;
    width: 100%;
    min-height: 3rem;
  }

  .titlebar-menu {
    display: flex;
    height: 100%;
    width: 100%;
    flex: 1 1 auto;
    align-items: center;
  }

  .appicon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 100%;
    position: relative;
    z-index: 4500;
    flex-shrink: 0;
    color: var(--text-second);
  }

  .window-controls {
    display: flex;
    flex: 0 0 auto;
    text-align: center;
    z-index: 9001;
    -webkit-app-region: no-drag;
    height: 100%;
  }

  .win-ico {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 46px;
    font-size: 16px;

    color: var(--text-second);
  }

  .win-ico:before {
    content: "";
    height: 16px;
    width: 16px;
    line-height: 16px;
    background-color: var(--text-second);
  }

  .win-ico.win-min:before {
    clip-path: path("M14 8v1H3V8z");
  }
  .win-ico.win-restore:before {
    clip-path: path("M5 3v2H3v9h9v-2h2V3H5zm1 1h7v7h-1V5H6V4zM4 6h7v7H4V6z");
  }
  .win-ico.win-close:before {
    clip-path: path(
      "m7.116 8l-4.558 4.558l.884.884L8 8.884l4.558 4.558l.884-.884L8.884 8l4.558-4.558l-.884-.884L8 7.116L3.442 2.558l-.884.884z"
    );
  }
</style>
