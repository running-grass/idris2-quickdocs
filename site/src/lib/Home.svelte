<script lang="ts">
import { createEventDispatcher } from "svelte"
// @ts-ignore
import About from "./About.svelte.md"

export let promise_package_list: Promise<string[]>

const dispatchEvent = createEventDispatcher()

// url has no 'data/' part
function navigateTo(package_name: string) {
  dispatchEvent("navigate-to-package", package_name)
}
</script>

<article class="root">
  <h2>Available Packages</h2>
	<p>Click the links below to see all namespaces in a package.</p>

  {#await promise_package_list}
    <p>⏳ Loading package list</p>
    <noscript>
      <p>Nope, it's not loading. You don't have Javascript enabled.</p>
    </noscript>
  {:then package_list}
    <nav class="flex">
      {#each Array.from(package_list).sort() as package_name}
        <a
          href="data/{package_name}/docs/index.html"
          on:click|preventDefault="{() => navigateTo(package_name)}">{package_name}</a
        >
      {/each}
    </nav>
  {/await}

  <About />
</article>

<style lang="scss">
article {
  padding: 1rem 2rem;
  font-size: 12pt;
}
.flex {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  column-gap: 1rem;
}
</style>
