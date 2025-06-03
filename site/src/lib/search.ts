export type SearchItemRaw = {
  html_filename: string
  package: string
  namespace: string
  name: string
  typ: string
  html_id: string
}

export type SearchItemSpecifier = {
  package: string
  namespace: string
  name: string
  target?: string
}

export type PackageSpecifier = {
  package: string
  target: string
}

export type ItemOrPackageSpecifier = SearchItemSpecifier | PackageSpecifier

export type SearchItem = {
  html_filename: string
  package: string
  namespace: string
  name: string
  typ: string
  html_id: string
  target: string
  // calculated fields
  fullname?: string
}

let fetch_cache: Map<string, { fetchedAt: Date; data: Promise<any> }> = new Map()

export async function fetchIndex(url: string, package_name: string, cacheDuration: number): Promise<SearchItem[]> {
  let maybe_cached = fetch_cache.get(url)
  if (maybe_cached) {
    let {fetchedAt, data} = maybe_cached
    if (Date.now() - fetchedAt.getTime() < cacheDuration) {
      return await data
    }
  }

  const res = fetchIndex_helper(url, package_name)
  fetch_cache.set(url, { fetchedAt: new Date(), data: res })
  return await res
}

async function fetchIndex_helper(url: string, package_name: string): Promise<SearchItem[]> {
  let res = await fetch(url)
  let rawData = (await res.json()) as SearchItemRaw[]
  return rawData.map((entry_raw) => {
    let entry = entry_raw as SearchItem
    entry.target = entry_raw.html_filename + "#" + entry_raw.html_id
    if (!entry.package) entry.package = package_name
    return entry
  })
}

// @ts-ignore
import { fuzzyFilter1 } from "fuzzbunny"
import type { FuzzyFilterResult1 } from "fuzzbunny/build/fuzzybunny-extra"

export function weighted(o: FuzzyFilterResult1<SearchItem>) {
  let fullname = o.scores.fullname || 0
  let name = o.scores.name || 0
  // let namespace = o.scores.namespace || 0
  return fullname * 1 + name * 5
}

export function search(searchTerm: string, data: SearchItem[]): SearchItem[] {
  if (searchTerm == "") return data
  return fuzzyFilter1(data, searchTerm, { fields: ["name", "fullname"] })
    .sort(
      (a: FuzzyFilterResult1<SearchItem>, b: FuzzyFilterResult1<SearchItem>) =>
        weighted(b) - weighted(a)
    )
    .map((o: FuzzyFilterResult1<SearchItem>) => o.item)
}

export type FilterOption = {
  query?: string
  in_packages?: Array<string>
}

export type PackageName = string

export type SearchParams<T> = {
  items: Map<PackageName, Array<T>>
  options: FilterOption
}

export function* searchIdrisEntry({
  items,
  options,
}: SearchParams<SearchItem>): Iterable<SearchItem> {
  let entries: Array<SearchItem>
  if (options.in_packages) {
    const in_packages = options.in_packages
    entries = Array.from(items.entries())
      .filter(([key, value]) => in_packages.indexOf(key) != -1)
      .map(([key, value]) => value)
      .flat()
  } else {
    entries = Array.from(items.values()).flat()
  }

  if (options.query) {
    for (const entry of entries) {
      if (!entry.fullname) entry.fullname = entry.namespace + "." + entry.name
    }
    yield* search(options.query, entries)
  } else {
    yield* entries
  }
}

import * as _ from "lodash"

export function match_type_enough(entry: SearchItem, regex: RegExp): boolean {
  return entry.typ.match(regex) != null
}

export function make_type_regex(desired_type: string): RegExp {
  let seenLowers: string[] = []

  let regex_string = []
  let tokens = desired_type.split(" ")
  for (let token of tokens) {
    if (token == "") continue
    if (isAllLowers(token)) {
      let i = seenLowers.indexOf(token)
      if (i < 0) {
        seenLowers.push(token)
        regex_string.push("([\\w ]+)")
      } else {
        regex_string.push(`\\${i + 1}`)
      }
    } else {
      // treat as normal identifier
      regex_string.push(_.escapeRegExp(token))
    }
  }
  let s = regex_string.join(" ")
  console.log("Type Query:", s)
  return new RegExp(s)
}

function isAllLowers(token: string): boolean {
  for (let i = 0; i < token.length; ++i) {
    let c = token.charCodeAt(i)
    if (c < "a".charCodeAt(0) || c > "z".charCodeAt(0)) return false
  }
  return true
}

export function sanitizeEntry(
  selectedEntry: ItemOrPackageSpecifier | undefined
): SearchItemSpecifier | undefined {
  if (selectedEntry == undefined) return undefined
  if (typeof (selectedEntry as any).name == "undefined")
    return selectedEntry as SearchItemSpecifier
  return undefined
}

export const DEFAULT_PACKAGES = ['prelude', 'base']
export const BUILTIN_PACKAGES = ['prelude', 'base', 'linear', 'network', 'test', 'contrib']
