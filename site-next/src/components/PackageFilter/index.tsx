import React from 'react'
import styles from './styles.module.css'

interface PackageFilterProps {
  availablePackages: string[]
  selectedPackages: string[]
  onPackageSelect: (packageName: string) => void
}

export const PackageFilter: React.FC<PackageFilterProps> = ({
  availablePackages,
  selectedPackages,
  onPackageSelect,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Packages</h3>
        <span className={styles.count}>{selectedPackages.length} selected</span>
      </div>
      <div className={styles.packageList}>
        {availablePackages.map((packageName) => (
          <label key={packageName} className={styles.packageItem}>
            <input
              type="checkbox"
              checked={selectedPackages.includes(packageName)}
              onChange={() => onPackageSelect(packageName)}
            />
            <span className={styles.packageName}>{packageName}</span>
          </label>
        ))}
      </div>
    </div>
  )
} 