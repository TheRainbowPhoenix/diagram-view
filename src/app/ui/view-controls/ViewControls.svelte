<script lang="ts">
  import { getContext, onMount } from "svelte";
  import type { App } from "../../types";
  import CONSTANTS from "../../constants";

  interface AppCtx {
    app: () => App;
  }

  const appCtx: AppCtx = getContext("root");

  $: app = appCtx.app();

  // const { app } = getContext("root") as {
  //   app: () => App;
  // };

  const zoomOut = () => {
    app.canvas.camera.changeZoomBy(-1);
  };
  const zoomIn = () => {
    app.canvas.camera.changeZoomBy(1);
  };
  const undo = () => {
    app.state.history.undo();
  };
  const redo = () => {
    app.state.history.redo();
  };

  const redraw = () => {
    app.canvas.onResize();
  };

  const pan = () => {
    // if (this.$data.hintShown === false) {
    //   this.$data.showHint = true;
    //   this.$data.hintShown = true;
    //   setTimeout(() => {
    //     this.$data.showHint = false;
    //   }, 5e3);
    // }

    app.interactionMode.set(CONSTANTS.INTERACTION_MODE.PAN_ON_DRAG);
  };

  const toggleTopDown = () => {
    app.canvas.camera.toggleTopDown();
  };
</script>

<div class="view-container">
  <div class="view-controls">
    <div class="toolbar">
      <button class="toolbar" title="zoom in" on:click={zoomIn}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          ><g fill="currentColor"
            ><path
              class="ico-solid"
              fill-rule="evenodd"
              d="M17.82 19.7c-.09-1.094.816-2.008 1.9-1.918c.189.016.414.085.643.154l.067.02l.06.018c.21.064.42.127.58.213a1.786 1.786 0 0 1 .637 2.549c-.1.152-.255.308-.41.464l-.045.045l-.044.045c-.155.157-.31.313-.46.414a1.754 1.754 0 0 1-2.527-.643c-.086-.161-.148-.373-.211-.585l-.018-.06l-.02-.068c-.07-.231-.137-.458-.152-.648Z"
              clip-rule="evenodd"
            /><path
              class="ico-line"
              d="M11.157 20.313a9.157 9.157 0 1 0 0-18.313a9.157 9.157 0 0 0 0 18.313Z"
              opacity=".5"
            /><path
              class="ico-solid"
              fill-rule="evenodd"
              d="M11.156 8.024c.4 0 .723.324.723.723v1.687h1.687a.723.723 0 1 1 0 1.446h-1.687v1.687a.723.723 0 0 1-1.446 0V11.88H8.746a.723.723 0 1 1 0-1.446h1.687V8.747c0-.399.324-.723.723-.723Z"
              clip-rule="evenodd"
            /></g
          ></svg
        >
      </button>

      <button title="reset zoom" on:click={redraw}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          ><g fill="currentColor"
            ><path
              class="ico-line"
              d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"
              opacity=".5"
            /><path
              class="ico-solid"
              d="M10.004 6.75a.75.75 0 0 0-.013-1.5c-.85.007-1.577.034-2.179.152c-.623.122-1.167.351-1.613.797c-.446.446-.675.99-.797 1.613c-.118.602-.145 1.328-.152 2.179a.75.75 0 0 0 1.5.013c.007-.856.035-1.454.124-1.904c.084-.428.212-.666.386-.84c.174-.174.412-.302.84-.386c.45-.088 1.048-.117 1.904-.124Zm4.003-1.5a.75.75 0 1 0-.013 1.5c.856.007 1.454.035 1.903.124c.429.084.666.212.84.386c.175.174.303.412.387.84c.088.45.116 1.048.124 1.904a.75.75 0 0 0 1.5-.013c-.008-.85-.034-1.577-.152-2.179c-.122-.623-.352-1.167-.798-1.613c-.446-.446-.99-.675-1.612-.797c-.603-.118-1.329-.145-2.18-.152ZM6.75 13.994a.75.75 0 0 0-1.5.013c.007.85.034 1.577.152 2.179c.122.623.351 1.167.797 1.613c.446.446.99.675 1.613.797c.602.119 1.328.145 2.179.152a.75.75 0 0 0 .013-1.5c-.856-.007-1.454-.036-1.904-.123c-.428-.084-.666-.213-.84-.387c-.174-.174-.302-.412-.386-.84c-.088-.45-.117-1.048-.124-1.904Zm11.997.013a.75.75 0 1 0-1.5-.013c-.007.856-.035 1.454-.123 1.904c-.084.428-.212.666-.386.84c-.175.174-.412.303-.84.387c-.45.087-1.048.116-1.904.123a.75.75 0 1 0 .013 1.5c.85-.007 1.576-.034 2.179-.152c.623-.122 1.166-.351 1.612-.797c.446-.446.676-.99.798-1.613c.118-.602.144-1.328.151-2.179Z"
            /></g
          ></svg
        >
      </button>

      <button title="zoom out" on:click={zoomOut}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          ><g fill="currentColor"
            ><path
              class="ico-solid"
              fill-rule="evenodd"
              d="M17.82 19.7c-.09-1.094.816-2.008 1.9-1.918c.189.016.414.085.643.154l.067.02l.06.018c.21.064.42.127.58.213a1.786 1.786 0 0 1 .637 2.549c-.1.152-.255.308-.41.464l-.045.045l-.044.045c-.155.157-.31.313-.46.414a1.754 1.754 0 0 1-2.527-.643c-.086-.161-.148-.373-.211-.585l-.018-.06l-.02-.068c-.07-.231-.137-.458-.152-.648Z"
              clip-rule="evenodd"
            /><path
              class="ico-line"
              d="M11.157 20.313a9.157 9.157 0 1 0 0-18.313a9.157 9.157 0 0 0 0 18.313Z"
              opacity=".5"
            /><path
              class="ico-solid"
              fill-rule="evenodd"
              d="M8.023 11.156c0-.399.324-.722.723-.722h4.82a.723.723 0 1 1 0 1.445h-4.82a.723.723 0 0 1-.723-.723Z"
              clip-rule="evenodd"
            /></g
          ></svg
        >
      </button>

      <hbr />

      <button title="undo" on:click={undo}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          ><g fill="currentColor"
            ><path
              class="ico-line"
              d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"
              opacity=".5"
            /><path
              class="ico-solid"
              fill-rule="evenodd"
              d="M9.301 6.915a.75.75 0 0 1-.042 1.06l-.84.775h5.657c.652 0 1.196 0 1.637.044c.462.046.89.145 1.28.397c.327.211.605.49.816.816c.252.39.351.819.397 1.28c.044.441.044.985.044 1.637V13c0 .652 0 1.196-.044 1.638c-.046.461-.145.89-.397 1.28a2.76 2.76 0 0 1-.816.816c-.39.251-.818.35-1.28.397c-.44.043-.985.043-1.637.043H9.5a.75.75 0 1 1 0-1.5h4.539c.699 0 1.168 0 1.526-.036c.347-.034.507-.095.614-.164a1.25 1.25 0 0 0 .37-.371c.07-.106.13-.267.165-.613c.035-.359.036-.828.036-1.527c0-.7 0-1.169-.036-1.527c-.035-.346-.096-.507-.164-.613a1.249 1.249 0 0 0-.371-.371c-.107-.07-.267-.13-.614-.164c-.358-.036-.827-.037-1.526-.037h-5.62l.84.776a.75.75 0 1 1-1.018 1.102l-2.25-2.077a.75.75 0 0 1 0-1.102l2.25-2.077a.75.75 0 0 1 1.06.043Z"
              clip-rule="evenodd"
            /></g
          ></svg
        >
      </button>

      <button title="redo" on:click={redo}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          ><g fill="currentColor"
            ><path
              class="ico-line"
              d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"
              opacity=".5"
            /><path
              class="ico-solid"
              fill-rule="evenodd"
              d="M14.699 6.915a.75.75 0 0 1 1.06-.043l2.25 2.077a.75.75 0 0 1 0 1.102l-2.25 2.077a.75.75 0 0 1-1.018-1.102l.84-.776h-5.62c-.699 0-1.168.001-1.526.037c-.347.034-.507.095-.614.164a1.249 1.249 0 0 0-.37.37c-.07.107-.13.268-.165.614c-.035.358-.036.828-.036 1.527s0 1.168.036 1.527c.035.346.096.507.164.613c.096.149.223.275.371.371c.107.069.267.13.614.164c.358.035.827.036 1.527.036H14.5a.75.75 0 0 1 0 1.5H9.924c-.652 0-1.196 0-1.637-.043c-.462-.046-.89-.146-1.28-.397a2.75 2.75 0 0 1-.816-.817c-.252-.389-.352-.818-.397-1.28c-.044-.44-.044-.985-.044-1.637v-.075c0-.652 0-1.196.044-1.637c.046-.462.145-.89.397-1.28a2.75 2.75 0 0 1 .816-.816c.39-.252.818-.351 1.28-.397c.44-.044.985-.044 1.637-.044h5.658l-.84-.776a.75.75 0 0 1-.043-1.06Z"
              clip-rule="evenodd"
            /></g
          ></svg
        >
      </button>

      <button title="box" on:click={toggleTopDown}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          ><g fill="currentColor"
            ><path
              class="ico-solid"
              d="M8.422 20.618C10.178 21.54 11.056 22 12 22V12L2.638 7.073a3.196 3.196 0 0 0-.04.067C2 8.154 2 9.417 2 11.942v.117c0 2.524 0 3.787.597 4.801c.598 1.015 1.674 1.58 3.825 2.709l2 1.05Z"
            /><path
              class="ico-line"
              d="m17.577 4.432l-2-1.05C13.822 2.461 12.944 2 12 2c-.945 0-1.822.46-3.578 1.382l-2 1.05C4.318 5.536 3.242 6.1 2.638 7.072L12 12l9.362-4.927c-.606-.973-1.68-1.537-3.785-2.641Z"
              opacity="1"
            /><path
              class="ico-line"
              d="M21.403 7.14a3.153 3.153 0 0 0-.041-.067L12 12v10c.944 0 1.822-.46 3.578-1.382l2-1.05c2.151-1.129 3.227-1.693 3.825-2.708c.597-1.014.597-2.277.597-4.8v-.117c0-2.525 0-3.788-.597-4.802Z"
              opacity=".6"
            /></g
          ></svg
        >
      </button>

      <button title="circle in">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          ><g fill="currentColor"
            ><path
              class="ico-line"
              d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10Z"
              opacity=".5"
            /><path
              class="ico-solid"
              fill-rule="evenodd"
              d="M4.25 13a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-4.19l-6.72 6.72a.75.75 0 0 1-1.06-1.06l6.72-6.72H5a.75.75 0 0 1-.75-.75Z"
              clip-rule="evenodd"
            /></g
          ></svg
        >
      </button>
      <button title="circle out">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          ><g fill="currentColor"
            ><path
              class="ico-line"
              d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10Z"
              opacity=".5"
            /><path
              class="ico-solid"
              fill-rule="evenodd"
              d="M12.47 11.53a.75.75 0 0 1 0-1.06l7.72-7.72h-3.534a.75.75 0 0 1 0-1.5H22a.75.75 0 0 1 .75.75v5.344a.75.75 0 0 1-1.5 0V3.81l-7.72 7.72a.75.75 0 0 1-1.06 0Z"
              clip-rule="evenodd"
            /></g
          ></svg
        >
      </button>

      <button title="code source">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          ><g fill="currentColor"
            ><path
              fill-rule="evenodd"
              class="ico-line"
              d="M10 22h4c3.771 0 5.657 0 6.828-1.172C22 19.657 22 17.771 22 14v-.437c0-.873 0-1.529-.043-2.063h-4.052c-1.097 0-2.067 0-2.848-.105c-.847-.114-1.694-.375-2.385-1.066c-.692-.692-.953-1.539-1.067-2.386c-.105-.781-.105-1.75-.105-2.848l.01-2.834c0-.083.007-.164.02-.244C11.121 2 10.636 2 10.03 2C6.239 2 4.343 2 3.172 3.172C2 4.343 2 6.229 2 10v4c0 3.771 0 5.657 1.172 6.828C4.343 22 6.229 22 10 22Z"
              clip-rule="evenodd"
              opacity=".5"
            /><path
              class="ico-solid"
              d="M10.702 14.264a.75.75 0 1 0-1.404-.527l-1.5 4a.75.75 0 1 0 1.404.527l1.5-4Zm-3.172.266a.75.75 0 1 0-1.06-1.06l-1 1a.75.75 0 0 0 0 1.06l1 1a.75.75 0 0 0 1.06-1.06L7.06 15l.47-.47Zm4.5.94a.75.75 0 1 0-1.06 1.06l.47.47l-.47.47a.75.75 0 1 0 1.06 1.06l1-1a.75.75 0 0 0 0-1.06l-1-1Zm-.52-13.21l-.01 2.835c0 1.097 0 2.066.105 2.848c.114.847.375 1.694 1.067 2.385c.69.691 1.538.953 2.385 1.067c.781.105 1.751.105 2.848.105h4.052c.013.155.022.321.028.5H22c0-.268 0-.402-.01-.56a5.322 5.322 0 0 0-.958-2.641c-.094-.128-.158-.204-.285-.357C19.954 7.494 18.91 6.312 18 5.5c-.81-.724-1.921-1.515-2.89-2.162c-.832-.555-1.248-.833-1.819-1.04a5.488 5.488 0 0 0-.506-.153c-.384-.095-.758-.128-1.285-.14l.01.255Z"
            /></g
          ></svg
        >
      </button>

      <button title="compass">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          ><g fill="currentColor"
            ><path
              class="ico-line"
              d="M3.464 20.535C4.93 22 7.286 22 12 22c4.714 0 7.071 0 8.535-1.465C22 19.072 22 16.714 22 12s0-7.071-1.465-8.536C19.072 2 16.714 2 12 2S4.929 2 3.464 3.464C2 4.93 2 7.286 2 12c0 4.714 0 7.071 1.464 8.535Z"
              opacity=".5"
            /><path
              class="ico-solid"
              d="M13.024 14.56c.493-.197.739-.296.932-.465c.05-.043.096-.09.139-.139c.17-.193.268-.44.465-.932c.924-2.31 1.386-3.465.938-4.124a1.5 1.5 0 0 0-.398-.398c-.66-.448-1.814.014-4.124.938c-.493.197-.74.295-.933.465c-.049.043-.095.09-.138.139c-.17.193-.268.44-.465.932c-.924 2.31-1.386 3.464-.938 4.124a1.5 1.5 0 0 0 .398.398c.66.448 1.814-.014 4.124-.938Z"
            /></g
          ></svg
        >
      </button>
    </div>
  </div>
</div>

<style>
  .view-container {
    position: absolute;
    right: 11px;
    z-index: 2;
    bottom: 11px;

    /* margin-top: -86px; */

    display: flex;
    flex-direction: row;
  }

  .ico-solid {
    fill: #fff;
    box-shadow: 0 0 3px #ffffff26;
    transition: all 400ms ease;
  }

  .ico-line {
    fill: #ffffff32;
    backdrop-filter: blur(3px);
    box-shadow:
      inset -1px 0 1px rgb(255 255 255 / 6%),
      inset 0 0 8px rgba(255, 255, 255, 0.04);
    transition: all 400ms ease;
  }

  button:hover .ico-solid {
    fill: var(--accent);
    box-shadow: 0 0 3px var(--accent);
    transition: all 400ms ease;
  }
  button:hover .ico-line {
    fill: #ffffff52;
    transition: all 400ms ease;
  }

  .toolbar button {
    border: none;
    background-color: transparent;
    width: 40px;
    height: 40px;
    padding: 2px;
    transition: all 400ms ease;
    outline: 0;
  }

  .toolbar button:hover {
    background-color: rgba(255, 255, 255, 0.03);
    transition: all 400ms ease;
  }

  .view-controls {
    margin-left: auto;
    padding: 5px 10px 4px 4px;
    display: flex;
    flex-direction: row;
    transition: all 400ms ease;

    border-radius: 22px;
    background-color: rgba(28, 28, 34, 0.6);
    /* background-color: rgba(255, 255, 255, 0.04); */
    backdrop-filter: blur(16px);
    box-shadow:
      inset -1px 0 1px rgb(255 255 255 / 6%),
      inset 0 0 8px rgba(255, 255, 255, 0.04);

    padding: 16px;

    /* margin-right: -16px; */
    margin-bottom: 16px;
  }
</style>
