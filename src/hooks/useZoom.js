import { useState, useCallback, useRef } from 'react'
import { PIXEL_SIZE } from '../constants'

/**
 * Custom hook for managing zoom and pan
 * @param {Object} spriteSize - { width, height }
 * @param {number} zoomSpeed - Zoom speed for scroll wheel (0.05 = slow, 0.3 = fast)
 * @returns {Object} - Zoom/pan state and handlers
 */
export function useZoom(spriteSize, zoomSpeed = 0.15) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)
  
  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(20, prev * 1.5))
  }, [])
  
  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.1, prev / 1.5))
  }, [])
  
  const handleZoomReset = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])
  
  const handleZoomToFit = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])
  
  const handleZoomTo100 = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight
    const scaleX = displayWidth / (spriteSize.width * PIXEL_SIZE)
    const scaleY = displayHeight / (spriteSize.height * PIXEL_SIZE)
    const fitScale = Math.min(scaleX, scaleY)
    
    // Zoom to 1:1 pixel ratio
    const pixelPerfectZoom = 1 / fitScale
    setZoom(pixelPerfectZoom)
    setPan({ x: 0, y: 0 })
  }, [spriteSize])
  
  // Scroll-wheel zoom: zoom toward the cursor
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Zoom factor per wheel notch (use setting)
    const delta = e.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed
    const newZoom = Math.max(0.1, Math.min(20, zoom * delta))
    
    // No change => bail
    if (newZoom === zoom) return
    
    const displayWidth = rect.width
    const displayHeight = rect.height
    
    // This matches how your canvas fits the sprite
    const baseScaleX = displayWidth / (spriteSize.width * PIXEL_SIZE)
    const baseScaleY = displayHeight / (spriteSize.height * PIXEL_SIZE)
    const baseScale = Math.min(baseScaleX, baseScaleY)
    
    const oldScale = baseScale * zoom
    const newScale = baseScale * newZoom
    
    const canvasCenterX = displayWidth / 2
    const canvasCenterY = displayHeight / 2
    
    // Where the sprite is currently drawn
    const oldSpriteWidth = spriteSize.width * PIXEL_SIZE * oldScale
    const oldSpriteHeight = spriteSize.height * PIXEL_SIZE * oldScale
    const oldSpriteLeft = canvasCenterX - oldSpriteWidth / 2 + pan.x
    const oldSpriteTop = canvasCenterY - oldSpriteHeight / 2 + pan.y
    
    // World (pixel) coordinate under the mouse *before* zoom
    const pixelX = (mouseX - oldSpriteLeft) / (oldScale * PIXEL_SIZE)
    const pixelY = (mouseY - oldSpriteTop) / (oldScale * PIXEL_SIZE)
    
    // Where the sprite would be with zero pan at the new zoom
    const newSpriteWidth = spriteSize.width * PIXEL_SIZE * newScale
    const newSpriteHeight = spriteSize.height * PIXEL_SIZE * newScale
    const newSpriteLeftNoPan = canvasCenterX - newSpriteWidth / 2
    const newSpriteTopNoPan = canvasCenterY - newSpriteHeight / 2
    
    // Choose pan so that the same pixel stays under the cursor
    const newPanX = mouseX - (newSpriteLeftNoPan + pixelX * newScale * PIXEL_SIZE)
    const newPanY = mouseY - (newSpriteTopNoPan + pixelY * newScale * PIXEL_SIZE)
    
    setZoom(newZoom)
    setPan({ x: newPanX, y: newPanY })
  }, [zoom, pan, spriteSize, zoomSpeed])
  
  // Pan handlers
  const handlePanStart = useCallback((e) => {
    setIsPanning(true)
    setLastPanPosition({ x: e.clientX, y: e.clientY })
  }, [])
  
  const handlePanMove = useCallback((e) => {
    if (!isPanning) return
    const dx = e.clientX - lastPanPosition.x
    const dy = e.clientY - lastPanPosition.y
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    setLastPanPosition({ x: e.clientX, y: e.clientY })
  }, [isPanning, lastPanPosition])
  
  const handlePanEnd = useCallback(() => {
    setIsPanning(false)
  }, [])
  
  return {
    zoom,
    pan,
    setPan,
    isPanning,
    canvasRef,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleZoomToFit,
    handleZoomTo100,
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd
  }
}

