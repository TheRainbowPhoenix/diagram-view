<script lang="ts">
  import Nav from "./lib/Nav.svelte";
  import Router from "./router/Router.svelte";

  export let url = "";
</script>

<main>
  <Nav visible={true} />
  <Router bind:url />
  <p>
    Check out <a
      href="https://github.com/sveltejs/kit#readme"
      target="_blank"
      rel="noreferrer">SvelteKit</a
    >, the official Svelte app framework powered by Vite!
  </p>
</main>

<style>
</style>
