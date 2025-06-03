import React, { useEffect } from 'react'
import styles from './styles.module.css'

interface DocViewerProps {
  src: string
}

export const DocViewer: React.FC<DocViewerProps> = ({ src }) => {
  const handleLoad = (evt: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = evt.target as HTMLIFrameElement
    iframe.contentWindow?.addEventListener('keypress', (e) => {
      if (e.key === '/') {
        e.preventDefault()
        document.querySelector('input')?.focus()
      }
    })
  }

  return (
    <iframe
      src={src}
      title="documentation viewer"
      className={styles.iframe}
      onLoad={handleLoad}
    >
      Idris documentation page loading...
    </iframe>
  )
} 