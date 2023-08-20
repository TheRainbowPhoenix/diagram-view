<script lang="ts">
  import { Route, Router } from "svelte-routing";
  import { routes } from "../router/routes";

  export let url = "";
</script>

<Router {url}>
  {#each routes as route}
    <Route path={route.url}>
      <!-- <h1>{route.name}</h1> -->
      <svelte:component this={route.component} />
    </Route>
  {/each}
</Router>
