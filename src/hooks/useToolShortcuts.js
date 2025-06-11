import { useEffect } from 'react'

export const useToolShortcuts = (setCurrentTool, shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tool shortcuts
      const tool = shortcuts[e.key.toLowerCase()]
      if (tool) {
        e.preventDefault()
        setCurrentTool(tool)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setCurrentTool, shortcuts])
} 