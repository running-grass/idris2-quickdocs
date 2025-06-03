'use client'

import React, { useEffect, useState } from 'react'
import { SearchBox } from '@/components/SearchBox'
import { DocViewer } from '@/components/DocViewer'
import { PackageFilter } from '@/components/PackageFilter'
import { fetchIndex } from '@/lib/search'
import type { SearchItem } from '@/lib/types'
import styles from './page.module.css'
import { SearchResultList } from '@/components/SearchResultList'
import { useDebounce } from 'use-debounce'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermByType, setSearchTermByType] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 200)
  const [debouncedSearchTermByType] = useDebounce(searchTermByType, 200)
  const [selectedEntry, setSelectedEntry] = useState<SearchItem | null>(null)
  const [indexByPackage, setIndexByPackage] = useState<Map<string, SearchItem[]>>(new Map())
  const [availablePackages, setAvailablePackages] = useState<string[]>([])
  const [selectedPackages, setSelectedPackages] = useState<string[]>(['prelude', 'base'])

  useEffect(() => {
    // 获取包列表
    fetch('/data/_packages.json')
      .then(res => res.json())
      .then(packages => {
        setAvailablePackages(packages)
      })
  }, [])

  useEffect(() => {
    // 获取选中包的索引
    selectedPackages.forEach(packageName => {
      if (!indexByPackage.has(packageName)) {
        fetchIndex(`/data/${packageName}.json`, packageName, 10000)
          .then(items => {
            setIndexByPackage(prev => new Map(prev).set(packageName, items))
          })
          .catch(console.error)
      }
    })
  }, [selectedPackages])

  const handlePackageSelect = (packageName: string) => {
    setSelectedPackages(prev => {
      if (prev.includes(packageName)) {
        return prev.filter(p => p !== packageName)
      } else {
        return [...prev, packageName]
      }
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          primary
        />
        <SearchBox
          value={searchTermByType}
          onChange={setSearchTermByType}
          placeholder="Type *type* of the term here"
        />
        <PackageFilter
          availablePackages={availablePackages}
          selectedPackages={selectedPackages}
          onPackageSelect={handlePackageSelect}
        />
        <SearchResultList
          searchTerm={debouncedSearchTerm}
          searchTermByType={debouncedSearchTermByType}
          indexByPackage={indexByPackage}
          selectedPackages={selectedPackages}
          selectedEntry={selectedEntry}
          onSelect={setSelectedEntry}
        />
      </div>
      <div className={styles.content}>
        {selectedEntry ? (
          <DocViewer src={`/data/${selectedEntry.target}`} />
        ) : (
          <div className={styles.home}>
            <h2>Available Packages</h2>
            <p>Click the links below to see all namespaces in a package.</p>
            <nav className={styles.packageList}>
              {availablePackages.map(packageName => (
                <a
                  key={packageName}
                  href={`/data/${packageName}/docs/index.html`}
                  onClick={(e) => {
                    e.preventDefault()
                    setSelectedEntry({
                      package: packageName,
                      target: `${packageName}/docs/index.html`
                    } as SearchItem)
                  }}
                >
                  {packageName}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}