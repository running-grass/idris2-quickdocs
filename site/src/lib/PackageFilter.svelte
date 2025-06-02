<script lang="ts">
import PackageSelectCheckbox from "./PackageSelectCheckbox.svelte"
import { BUILTIN_PACKAGES } from "./search";
import _ from "lodash"

export let packages: Array<{ name: string; loaded: boolean, ignored: boolean }> = []

$: packages_vendored = packages.filter(p => BUILTIN_PACKAGES.includes(p.name))
$: packages_3rdparty = packages.filter(p => !packages_vendored.includes(p))

/**
 * if null, then don't filter
 */
export let value: Array<string> = []
export let enabled = true
</script>

{#if packages.length == 0}
  No package loaded
{:else}
  <div class="flex space-around">
		<span>
			Legends:
			<span class="legend">
				<span class="loaded">loaded</span>
				<span class="selected">selected</span>
				<span class="ignored" title="It means this package's index cannot be fetched across network">ignored?</span>
			</span>
    </span>
    <span>
      <input type="checkbox" bind:checked="{enabled}" />ENABLED
    </span>
  </div>
  <div class="flex">
    {#each packages_vendored as package_}
      <PackageSelectCheckbox
				ignored={package_.ignored}
        loaded="{package_.loaded}"
        bind:group="{value}"
        value="{package_.name}"
        text="{package_.name || '∅'}"
      />
    {/each}
  </div>
  <hr>
  <div class="flex">
    {#each packages_3rdparty as package_}
      <PackageSelectCheckbox
				ignored={package_.ignored}
        loaded="{package_.loaded}"
        bind:group="{value}"
        value="{package_.name}"
        text="{package_.name || '∅'}"
      />
    {/each}
  </div>
  <hr>
{/if}

<style lang="scss">
@import 'PackageSelect.css';
// .legend {
// 	// border: 2px dotted grey;
// }
.flex {
	align-items: center;
  display: flex;
  flex-wrap: wrap;
}
.space-around {
  justify-content: space-between;
}
hr {
  width: 100%;
  margin: 0;
  color: lightgray;
}
</style>
