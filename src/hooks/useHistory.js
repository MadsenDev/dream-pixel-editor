import { useState, useCallback, useEffect } from 'react'

/**
 * Custom hook for managing undo/redo history
 * @param {Array} initialFrames - Initial frames state
 * @param {Function} onHistoryChange - Callback when history changes (to update frames)
 * @returns {Object} - History state and functions
 */
export function useHistory(initialFrames, onHistoryChange) {
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Save state to history
  const saveToHistory = useCallback((frames) => {
    const framesCopy = frames.map(frame => ({
      ...frame,
      layers: frame.layers.map(layer => ({
        ...layer,
        pixels: layer.pixels.map(row => [...row])
      }))
    }))
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(framesCopy)
      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift()
        return newHistory
      }
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])
  
  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1
      const prevFrames = history[prevIndex]
      onHistoryChange(() => prevFrames)
      setHistoryIndex(prevIndex)
    }
  }, [history, historyIndex, onHistoryChange])
  
  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      const nextFrames = history[nextIndex]
      onHistoryChange(() => nextFrames)
      setHistoryIndex(nextIndex)
    }
  }, [history, historyIndex, onHistoryChange])
  
  // Initialize history on mount
  useEffect(() => {
    if (history.length === 0 && initialFrames && initialFrames.length > 0) {
      saveToHistory(initialFrames)
    }
  }, []) // Only run once on mount
  
  return {
    saveToHistory,
    handleUndo,
    handleRedo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  }
}

