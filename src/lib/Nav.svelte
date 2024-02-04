<script>
  import { Link, Router, navigate } from "svelte-routing";

  import { fade, scale, slide } from "svelte/transition";
  import { cubicInOut, elasticOut } from "svelte/easing";

  export let visible = false;

  import { routes } from "../router/routes";
  import MainMenu from "./MainMenu.svelte";
  import AppIcon from "./icons/AppIcon.svelte";
</script>

<nav aria-label="Main">
  <!-- <div class="navbar">
    <div class="items">
      <div class="toggle-wrapper">
        <label>
          <input
            type="checkbox"
            class="toggle"
            id="menu"
            bind:checked={visible}
          />
          ☰
        </label>
      </div>

      {#if visible}
        <div
          class="wrapper"
          transition:slide={{ duration: 750, delay: 100, easing: cubicInOut }}
        >
          <Router>
            {#each routes as route}
              <Link
                class="link"
                to={route.url}
                on:click={() => {
                  navigate(route.url) /* , (visible = false)*/;
                }}
              >
                {route.name}
              </Link>
            {/each}
          </Router>
        </div>
      {/if}
    </div>
  </div> -->
</nav>

<style>
  * {
    margin: 0;
    padding: 0;
  }

  nav {
    display: flex;
    /* height: 56px; */

    padding: 0;
    backdrop-filter: blur(12px);
    /* border-style: solid; */
    /* border-width: 0 0 1px; */
    /* border-color: rgb(48, 48, 48); */
    z-index: 40;

    /* background-color: rgba(48, 48, 48, 0.4); */

    position: sticky;
    top: 0;

    /* margin: 1rem; */
    /* border-radius: 22px; */

    /* margin: 0 1rem 1rem 0;
    border-radius: 0 0 22px 0; */
  }

  /* Old menu */

  .navbar {
    /* max-width: 1419px; */
    padding: 8px 16px 8px 16px;
    justify-content: space-between;
    flex-wrap: wrap;

    margin-left: auto;
    margin-right: auto;

    width: 100%;
    display: flex;
    align-items: center;
  }

  .items {
    display: flex;
    flex: 1 1 0%;
    gap: 24px;
    align-items: center;
  }

  .wrapper {
    display: flex;
    flex: 1 1 0%;
    gap: 24px;
    align-items: center;
  }

  .toggle-wrapper {
    position: relative;
    width: 24px;
    display: block;
    height: 24px;
  }

  .toggle-wrapper label {
    width: 32px;
    display: flex;
    height: 32px;
    margin-top: -4px;
    position: absolute;
    justify-content: center;
    align-items: center;
    margin-left: -4px;
  }

  /* DELETE THIS LATER */

  input#menu {
    display: none;
  }

  label,
  :global(nav .link) {
    font-size: 1em;
    cursor: pointer;
    color: #ffffff;
    text-decoration: none;
    transition: 0.5s cubic-bezier(0, 0.51, 0.17, 1);
  }

  label:hover,
  :global(nav .link:hover) {
    color: var(--accent);
    transition: 0.5s cubic-bezier(0, 0.51, 0.17, 1);
    animation: sway 1s ease-in-out;
  }

  @keyframes sway {
    50% {
      transform: scale(40px);
    }
    /* 100% {
        transform: translateX(-2px);
    } */
  }
</style>
