<script lang="ts">
  import Nav from "./lib/Nav.svelte";
  import Router from "./router/Router.svelte";

  export let url = "";
</script>

<main>
  <Nav visible={true} />
  <Router bind:url />
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
</style>
