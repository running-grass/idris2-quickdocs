<script lang="ts">
/*
This component does a lot
  
- loading resources
- caching packages
- url mangling
- iframe onkeypress
*/

import SideBar from "$lib/SideBar.svelte"
import { fetchIndex, sanitizeEntry, type ItemOrPackageSpecifier } from "$lib/search"
import type { SearchItem } from "$lib/search"
import { store_selectedPackages } from "$lib/events";

import { onMount } from "svelte"

import { base } from "$app/paths"
import { goto, afterNavigate } from "$app/navigation"
import { page } from "$app/stores"
import { browser } from "$app/env"

let indexByPackage: Map<string, Array<SearchItem>> = new Map()
let ignoredPackages : Set<string> = new Set()
  
$: if (browser) {
  for (let package_name of $store_selectedPackages) {
    fetchPackageIndexCached(package_name)
  }
}

import _ from 'lodash';
import Home from "$lib/Home.svelte";
import DocViewer from "$lib/DocViewer.svelte";

let request_scroll_debounced: () => void;
if (browser) request_scroll_debounced = _.debounce(() => {elSearch?.requestScrollToSelected()}, 1000)

async function fetchPackageIndexCached(package_name: string): Promise<SearchItem[] | null> {
  if (ignoredPackages.has(package_name)) return null;
  if (indexByPackage.has(package_name)) return indexByPackage.get(package_name) as SearchItem[];
  try {
    let entrydata = await fetchIndex(`data/${package_name}.json`, package_name, 10 * 1000 /* cache for 10s */) 
    indexByPackage.set(package_name, entrydata)
    indexByPackage = indexByPackage
    request_scroll_debounced()
    return entrydata
  } catch {
    ignoredPackages.add(package_name)
    ignoredPackages = ignoredPackages
    console.error(`Failed to fetch index for '${package_name}'`)
    return null;
  }
}

let promise_package_list: Promise<string[]> = new Promise(()=>{})

onMount(() => {
  promise_package_list = fetch("data/_packages.json").then(res => res.json())
  promise_package_list.then(packages => {
    // todo: all packages
    ($store_selectedPackages).filter(x => packages.includes(x))
  })
})

let selectedEntry: ItemOrPackageSpecifier | undefined = undefined
let viewing: string | null
$: {
  if (selectedEntry && selectedEntry.target) {
    viewing = base + "/data/" + selectedEntry.target
  } else {
    viewing = null
  }
}

function forceNavigateToPackage(package_name: string) {
  selectedEntry = {
    package: package_name,
    target: package_name + '/index.html'
  }
  const url = new URL($page.url)
  url.searchParams.set("pkg", package_name)
  goto(url.toString())
}

let elSearch: SideBar | undefined

function entrySelected(event: CustomEvent<SearchItem>) {
  selectedEntry = event.detail

  const { name, namespace, package:package_ } = event.detail
  const url = new URL($page.url)
  url.searchParams.set("id", name)
  url.searchParams.set("ns", namespace)
  url.searchParams.set("pkg", package_)
  goto(url.toString())
}

async function onMountSearch() {
  const _data = await promise_package_list
  
  const to = $page.url
  let name = to.searchParams.get("id") || undefined
  let namespace = to.searchParams.get("ns") || undefined
  let package_ = to.searchParams.get("pkg") || undefined
  if (name && namespace && package_) {
    selectedEntry = {name, namespace, package: package_}
    request_scroll_debounced()
  }
}
</script>

<div class="flex-container">
  <div id="sidebar">
    <noscript>
      <p>
        Is JavaScript enabled?
      </p>
      <p>
        This page is a code search engine for Idris2 libraries. It runs entirely in your browser, so it need Javascript to work.
      </p>
    </noscript>
    {#await promise_package_list}
      <p>Loading</p>
      <noscript>
        <p>Nope, it's not loading. You don't have Javascript enabled.</p>
      </noscript>
    {:then package_list}
      <SideBar
        availablePackages="{package_list.sort()}"
        indexByPackage="{indexByPackage}"
        ignoredPackages="{ignoredPackages}"
        bind:selectedPackages={$store_selectedPackages}
        selected="{sanitizeEntry(selectedEntry)}"
        bind:this="{elSearch}"
        on:mount={onMountSearch}
        on:select="{entrySelected}"
      />
    {/await}
  </div>
  <div id="content" class:overflow-y={!viewing}>
    {#if viewing}
      <DocViewer src="{viewing}"/>
    {:else}
      <Home promise_package_list={promise_package_list} on:navigate-to-package="{evt => forceNavigateToPackage(evt.detail)}"/>
    {/if}
  </div>
</div>

<style lang="scss">
#sidebar {
  width: 30vw;
  height: 100%;
  border-right: 1px solid #ccc;
}

#content {
  flex-grow: 1;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

#content.overflow-y {
  overflow-y: scroll;
}

.flex-container {
  display: flex;
  flex-direction: row;
  height: 100%;
}

:global {
  html,
  body {
    margin: 0;
    height: 100%;
    box-sizing: border-box;

    font-family: "Trebuchet MS", Helvetica, sans-serif;
    font-size: 10pt;
  }

  * {
    box-sizing: inherit;
  }
}
</style>
