import { useEffect } from 'react'

export function PwaReloadPrompt() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('✅ Service Worker terdaftar:', registration.scope)
        })
        .catch((err) => {
          console.error('❌ Gagal mendaftar Service Worker:', err)
        })
    }
  }, [])

  // Tidak ada UI prompt karena autoUpdate (SW akan update otomatis di background)
  return null
}
