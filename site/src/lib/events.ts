import { writable, type Writable } from "svelte/store"
import { DEFAULT_PACKAGES, type SearchItemSpecifier } from "./search"
import { writable as writableLocalStorage } from 'svelte-local-storage-store'

/** Show documentation of Idris term */
export function selectEntry(entry: SearchItemSpecifier | undefined) {}

/** Show namespace list of a package: `package`/index.html */
export function selectPackageManifest(package_name: string) {}

export const store_selected_entry: Writable<SearchItemSpecifier | undefined> =
  writable(undefined)

export const store_selected_package: Writable<string | undefined> =
  writable(undefined)

/** url of iframe */
export const store_external_doc_url: Writable<string | undefined> =
  writable(undefined)

export const store_queryinput_is_focused: Writable<boolean> = writable(false)
/** Focus on search bar */
export const event_queryinput_focus: Writable<any> = writable()

/** Scroll sidebar */
export const event_scroll_to_select: Writable<any> = writable()


let queryinput_is_focused: boolean
store_queryinput_is_focused.subscribe(x => queryinput_is_focused = x)

export function onkeypress(evt: KeyboardEvent) {
  if (evt.key == "/" && !queryinput_is_focused) {
    evt.preventDefault()
    event_queryinput_focus.set({})
  }
}

export const store_selectedPackages: Writable<Array<string>> = writableLocalStorage('pref-selected-packages', DEFAULT_PACKAGES)
