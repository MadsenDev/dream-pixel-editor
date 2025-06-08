import { useEffect } from 'react'

export function useToolShortcuts(setCurrentTool, KEYBOARD_SHORTCUTS) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const key = e.key.toLowerCase()
      const tool = KEYBOARD_SHORTCUTS[key]
      if (tool) {
        e.preventDefault()
        setCurrentTool(tool)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [setCurrentTool, KEYBOARD_SHORTCUTS])
} 