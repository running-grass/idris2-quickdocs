import React, { useMemo, useRef } from 'react'
import type { SearchItem } from '@/lib/types'
import { searchIdrisEntry, make_type_regex, match_type_enough } from '@/lib/search'
import { useVirtualizer } from '@tanstack/react-virtual'
import styles from './styles.module.css'

interface SearchResultListProps {
  searchTerm: string
  searchTermByType: string
  indexByPackage: Map<string, SearchItem[]>
  selectedPackages: string[]
  selectedEntry: SearchItem | null
  onSelect: (entry: SearchItem) => void
}

export const SearchResultList: React.FC<SearchResultListProps> = ({
  searchTerm,
  searchTermByType,
  indexByPackage,
  selectedPackages,
  selectedEntry,
  onSelect,
}) => {
  const parentRef = useRef<HTMLDivElement>(null)

  // 计算搜索结果
  const results = useMemo(() => {
    let options: any = {}
    if (searchTerm.trim() !== '') options.query = searchTerm.trim()
    if (selectedPackages.length > 0) options.in_packages = selectedPackages
    let items = Array.from(
      searchIdrisEntry({ items: indexByPackage, options })
    )
    if (searchTermByType.trim() !== '') {
      const typeRegex = make_type_regex(searchTermByType.trim())
      items = items.filter((entry) => match_type_enough(entry, typeRegex))
    }
    return items
  }, [searchTerm, searchTermByType, indexByPackage, selectedPackages])

  const rowVirtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
    measureElement: (element) => {
      const height = element.getBoundingClientRect().height
      return height
    },
    paddingStart: 0,
    paddingEnd: 0,
  })

  return (
    <div className={styles.resultList}>
      <div className={styles.resultInfo}>{results.length} Results</div>
      <div ref={parentRef} style={{ height: '500px', overflowY: 'auto' }}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const entry = results[virtualRow.index]
            const isSelected =
              selectedEntry &&
              entry.package === selectedEntry.package &&
              entry.namespace === selectedEntry.namespace &&
              entry.name === selectedEntry.name

            return (
              <div
                key={entry.package + ':' + entry.namespace + ':' + entry.name}
                ref={rowVirtualizer.measureElement}
                className={[styles.item, isSelected ? styles.selected : ''].join(' ')}
                data-index={virtualRow.index}
                onClick={() => onSelect(entry)}
                tabIndex={0}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                  willChange: 'transform',
                }}
              >
                <div className={styles.itemContent}>
                  <span className={styles.name}>{entry.name}</span>
                  <span className={styles.separator}>:</span>
                  <span className={styles.type}>{entry.typ}</span>
                </div>
                <div className={styles.itemFooter}>
                  <span className={styles.namespace}>[{entry.namespace}]</span>
                  <span className={styles.package}>({entry.package})</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 