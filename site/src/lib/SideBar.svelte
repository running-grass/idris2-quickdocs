<script lang="ts">
import { DEFAULT_PACKAGES, make_type_regex, type SearchItem, type SearchItemSpecifier } from "$lib/search"
import { search } from "$lib/search"
import { createEventDispatcher, onMount } from "svelte"
import VirtualList from "svelte-virtual-list-ce"
import {
  match_type_enough,
  searchIdrisEntry,
  type FilterOption,
} from "./search"
import IdrisEntry from "./IdrisEntry.svelte"
import PackageFilter from "./PackageFilter.svelte"
import SearchBox from "./SearchBox.svelte"

const dispatchEvent = createEventDispatcher();

export let availablePackages: Array<string>
export let indexByPackage: Map<string, Array<SearchItem>>
export let selectedPackages: Array<string>
export let selected: SearchItemSpecifier | undefined
/// packages failed to download index file for
export let ignoredPackages: Set<string>
let searchTerm = ""
let searchTermByType = ""
let filterOpen = false

onMount(() => {
  dispatchEvent('mount');
})

function toggleFilter() {
  filterOpen = !filterOpen
}

function selectAll() {
  selectedPackages = [...availablePackages]
}

function selectNone() {
  selectedPackages = []
}

function selectDefault() {
  selectedPackages = DEFAULT_PACKAGES
}

let search_results: SearchItem[] = []
let filterEnabled: boolean

$: {
  let options: FilterOption = {}
  const query = searchTerm.trim()
  if (query != "") options.query = query
  if (filterEnabled) options.in_packages = selectedPackages

  let search_results_new = []
  let ignoreSearchType = searchTermByType.trim() == ""

  if (ignoreSearchType) {
    for (const newentry of searchIdrisEntry({
      items: indexByPackage,
      options,
    })) {
      search_results_new.push(newentry)
    }
  } else {
    let type_regex = make_type_regex(searchTermByType)
    for (const newentry of searchIdrisEntry({
      items: indexByPackage,
      options,
    })) {
      if (match_type_enough(newentry, type_regex)) {
        search_results_new.push(newentry)
      }
    }
  }
  search_results = search_results_new
}

/* scrolling magic below, no touch */

let el_list: VirtualList | undefined
$: {
  searchTerm,
    searchTermByType,
    el_list?.scrollToIndex(0, {
      behavior: "auto",
    })
}

function Entry_eq(left: SearchItemSpecifier, right: SearchItem): boolean {
  return (
    left.package == right.package &&
    left.name == right.name &&
    left.namespace == right.namespace
  )
}

let scroll_requested = false
export function requestScrollToSelected() {
  // console.log("scroll requested")
  if (!selected) {
    scroll_requested = false
    return
  }
  scroll_requested = true
  attemptScroll()
}
$: {
  search_results
  if (scroll_requested) {
    attemptScroll()
  }
}

function attemptScroll() {
  let success = scrollToSelected()
  if (success) {
    scroll_requested = false
  }
}

function scrollToSelected(): boolean {
  if (el_list && selected) {
    for (let i = 0; i < search_results.length; i++) {
      if (Entry_eq(selected, search_results[i])) {
        selected = search_results[i]
        el_list.scrollToIndex(i, { behavior: "auto" })
        return true
      }
    }
  }
  return false
}

export function select(entry: SearchItem) {
  selected = entry
  dispatchEvent("select", selected)
}

</script>

<div class="flex">
  <SearchBox
    primary
    placeholder="Type name of the term here"
    bind:value="{searchTerm}"
  />
  <SearchBox
    placeholder="Type *type* of the term here"
    bind:value="{searchTermByType}"
  />
  <dir id="info">
    <span>
      <span>{search_results.length} Results</span>
      {#if !filterOpen}
        |
        <a class="about-link" href="?" on:click={() => {selected = undefined}}>Home</a>
      {/if}
    </span>
    <span>
      {#if filterOpen}
        <button on:click="{selectDefault}">default</button>
        <button on:click="{selectNone}">clear all</button>
        <button on:click="{selectAll}">select all</button>
        <button on:click="{toggleFilter}">close</button>
      {:else}
        <button on:click={requestScrollToSelected} title="Use this to scroll to the entry denoted by current URL. It should scroll automatically on page load, but it's flaky.">Scroll To URL<sup>?</sup></button>
        <button on:click="{toggleFilter}">filter {selectedPackages.length}/{availablePackages.length}</button>
      {/if}
    </span>
  </dir>
  {#if filterOpen}
    <PackageFilter
      packages="{availablePackages.map((name) => ({
        name,
        loaded: indexByPackage.has(name),
        ignored: ignoredPackages.has(name),
      }))}"
      bind:value="{selectedPackages}"
      bind:enabled="{filterEnabled}"
    />
  {/if}
  <div id="results">
    <VirtualList
      items="{search_results}"
      bind:this="{el_list}"
      let:item="{entry}"
    >
      <IdrisEntry
        entry="{entry}"
        selected="{selected ? Entry_eq(selected, entry) : false}"
        on:click="{() => select(entry)}"
      />
    </VirtualList>
  </div>
</div>

<style lang="scss">
.flex {
  display: flex;
  flex-direction: column;
  height: 100%;
  > * {
    margin: 0;
    padding: 0;
  }
}
#info {
  box-shadow: inset 0px 0px 5px #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#results {
  flex-grow: 1;
  overflow: hidden;
}

// .about-link {
// }
</style>
