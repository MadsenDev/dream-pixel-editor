import { useEffect } from 'react'

/**
 * Custom hook for keyboard shortcuts (undo/redo/zoom)
 * @param {Object} handlers - Object with handler functions
 */
export function useKeyboardShortcuts({
  handleUndo,
  handleRedo,
  handleZoomIn,
  handleZoomOut,
  handleZoomReset,
  handleZoomToFit,
  handleZoomTo100
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      }
      // Zoom shortcuts
      else if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        handleZoomReset()
      } else if ((e.ctrlKey || e.metaKey) && e.key === '9') {
        e.preventDefault()
        handleZoomToFit()
      } else if (e.key === '1' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleZoomTo100()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo, handleZoomIn, handleZoomOut, handleZoomReset, handleZoomToFit, handleZoomTo100])
}

