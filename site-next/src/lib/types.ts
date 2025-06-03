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
  fullname?: string
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

export const DEFAULT_PACKAGES = ['prelude', 'base']
export const BUILTIN_PACKAGES = ['prelude', 'base', 'linear', 'network', 'test', 'contrib'] 