import { fuzzyFilter } from "fuzzbunny"
import type { FuzzyFilterResult1 } from "fuzzbunny/build/fuzzybunny-extra"
import _ from "lodash"
import type { SearchItem, SearchParams, ItemOrPackageSpecifier, SearchItemSpecifier } from "./types"

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
  let rawData = (await res.json()) as SearchItem[]
  return rawData.map((entry_raw) => {
    let entry = entry_raw as SearchItem
    entry.target = entry_raw.html_filename + "#" + entry_raw.html_id
    if (!entry.package) entry.package = package_name
    return entry
  })
}

export function weighted(o: FuzzyFilterResult1<SearchItem>) {
  const fullname = o.scores?.fullname || 0
  const name = o.scores?.name || 0
  return fullname * 1 + name * 5
}

export function search(searchTerm: string, data: SearchItem[]): SearchItem[] {
  if (searchTerm == "") return data
  return fuzzyFilter(data, searchTerm, { fields: ["name", "fullname"] })
    .sort(
      (a: FuzzyFilterResult1<SearchItem>, b: FuzzyFilterResult1<SearchItem>) =>
        weighted(b) - weighted(a)
    )
    .map((o: FuzzyFilterResult1<SearchItem>) => o.item)
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