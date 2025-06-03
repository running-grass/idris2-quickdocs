import React, { useEffect, useRef } from 'react'
import styles from './styles.module.css'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  primary?: boolean
  placeholder?: string
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  primary = false,
  placeholder = "Type name of the term here"
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keypress', handleKeyPress)
    return () => document.removeEventListener('keypress', handleKeyPress)
  }, [])

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
      {primary && <kbd className={styles.keyShortcut}>/</kbd>}
    </div>
  )
} 