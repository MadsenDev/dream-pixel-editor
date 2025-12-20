import React, { useState, useRef, useEffect } from 'react'
import { FaPlus, FaTrash, FaCopy, FaEye, FaEllipsisV } from 'react-icons/fa'

const MENU_WIDTH = 140
const MENU_HEIGHT = 80

const Timeline = ({
  frames,
  activeFrame,
  onSelectFrame,
  onAddFrame,
  onDeleteFrame,
  onDuplicateFrame,
  onReorderFrames,
  showOnionSkin,
  onToggleOnionSkin,
  spriteSize,
  settings
}) => {
  const [menuIdx, setMenuIdx] = useState(null)
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0 })
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const menuRef = useRef(null)
  const btnRefs = useRef([])
  const canvasRefs = useRef([])

  // Draw thumbnails
  useEffect(() => {
    frames.forEach((frame, idx) => {
      const canvas = canvasRefs.current[idx]
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const width = spriteSize.width
      const height = spriteSize.height
      // Set canvas size to match display size (80x80)
      canvas.width = 80
      canvas.height = 80
      ctx.clearRect(0, 0, 80, 80)
      
      // Calculate scale to fit sprite in 80x80
      const scale = Math.min(80 / width, 80 / height)
      const scaledWidth = width * scale
      const scaledHeight = height * scale
      const offsetX = (80 - scaledWidth) / 2
      const offsetY = (80 - scaledHeight) / 2
      
      // Fill background
      ctx.fillStyle = settings.backgroundColor || '#1f2937'
      ctx.fillRect(0, 0, 80, 80)
      
      // Draw sprite scaled up
      frame.layers.forEach(layer => {
        if (!layer.visible) return
        ctx.globalAlpha = layer.opacity
        for (let y = 0; y < layer.pixels.length; y++) {
          for (let x = 0; x < layer.pixels[y].length; x++) {
            const color = layer.pixels[y][x]
            if (color) {
              ctx.fillStyle = color
              ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale)
            }
          }
        }
        ctx.globalAlpha = 1
      })
    })
  }, [frames, spriteSize, settings])

  // Close menu on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest('.frame-options-btn')) {
        setMenuIdx(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Position menu to stay in viewport
  const handleMenuOpen = (idx, e) => {
    e.stopPropagation()
    const btn = btnRefs.current[idx]
    if (!btn) return

    const rect = btn.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let left = rect.right
    let top = rect.bottom

    // Check right overflow
    if (left + MENU_WIDTH > viewportWidth) {
      left = rect.left - MENU_WIDTH
    }

    // Check bottom overflow
    if (top + MENU_HEIGHT > viewportHeight) {
      top = rect.top - MENU_HEIGHT
    }

    setMenuPos({ left, top })
    setMenuIdx(idx)
  }

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    // Don't start drag if clicking on a button
    if (e.target.closest('button') && !e.target.closest('.drag-handle')) {
      e.preventDefault()
      return false
    }
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = ''
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    if (onReorderFrames) {
      onReorderFrames(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="w-full min-w-0 flex flex-col bg-neutral-800 border-t border-neutral-700 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-neutral-700">
        <h2 className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Timeline</h2>
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded-lg transition-all ${
              showOnionSkin 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30' 
                : 'bg-neutral-700 text-purple-300 hover:bg-neutral-600 hover:text-white'
            }`}
            onClick={onToggleOnionSkin}
            title="Toggle Onion Skin"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-500/30 transition-all"
            onClick={onAddFrame}
            title="Add Frame"
          >
            <FaPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frames */}
      <div className="px-4 py-4">
        <div className="flex items-end gap-3 overflow-x-auto max-w-full min-w-0 pb-1 pt-4 pl-4">
          {frames.map((frame, idx) => (
            <div 
              key={frame.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, idx)}
              className={`relative flex flex-col items-center group cursor-move transition-all ${
                dragOverIndex === idx ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-neutral-800' : ''
              } ${
                draggedIndex === idx ? 'opacity-50 scale-95' : ''
              }`}
            >
              {/* Frame thumbnail container */}
              <div className={`relative mb-2 transition-all ${
                idx === activeFrame 
                  ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-neutral-800 shadow-lg shadow-purple-500/40 scale-105' 
                  : 'hover:ring-2 hover:ring-purple-300/60 hover:shadow-md hover:shadow-purple-500/20'
              } rounded-lg`}>
                <button
                  onClick={(e) => {
                    // Only select if we're not in the middle of a drag
                    if (draggedIndex === null) {
                      onSelectFrame(idx)
                    }
                  }}
                  onMouseDown={(e) => {
                    // Prevent drag from starting when clicking the button
                    e.stopPropagation()
                  }}
                  className={`w-20 h-20 bg-neutral-700 border-2 rounded-lg shadow-lg flex items-center justify-center overflow-hidden transition-all ${
                    idx === activeFrame 
                      ? 'border-purple-400 bg-gradient-to-br from-neutral-700 to-neutral-800' 
                      : 'border-neutral-600 hover:border-purple-300/60'
                  }`}
                  style={{ outline: 'none' }}
                  tabIndex={0}
                  title={`Frame ${idx + 1}`}
                >
                  <canvas
                    ref={el => canvasRefs.current[idx] = el}
                    className="w-full h-full"
                    style={{ 
                      imageRendering: 'pixelated', 
                      background: settings.backgroundColor 
                    }}
                  />
                </button>
                
                {/* Frame options menu trigger */}
                <button
                  ref={el => btnRefs.current[idx] = el}
                  className="frame-options-btn absolute top-1 right-1 p-1.5 rounded-md bg-neutral-900/80 backdrop-blur-sm text-purple-300 hover:text-white hover:bg-purple-600/80 focus:outline-none opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  title="Frame Options"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMenuOpen(idx, e)
                  }}
                >
                  <FaEllipsisV className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {/* Frame number label */}
              <div className={`text-xs font-medium transition-colors ${
                idx === activeFrame 
                  ? 'text-purple-400' 
                  : 'text-neutral-400 group-hover:text-neutral-300'
              }`}>
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {menuIdx !== null && (
        <div
          ref={menuRef}
          className="fixed bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-50 overflow-hidden backdrop-blur-sm bg-neutral-800/95"
          style={{
            left: menuPos.left,
            top: menuPos.top,
            width: MENU_WIDTH,
            minWidth: MENU_WIDTH,
            maxWidth: MENU_WIDTH
          }}
        >
          <button
            onClick={() => { onDuplicateFrame(menuIdx); setMenuIdx(null) }}
            className="w-full px-4 py-2.5 text-left text-purple-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20 hover:text-white flex items-center gap-3 text-sm transition-all"
            title="Duplicate Frame"
          >
            <FaCopy className="w-4 h-4" /> Duplicate
          </button>
          <button
            onClick={() => { onDeleteFrame(menuIdx); setMenuIdx(null) }}
            className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-red-600/20 hover:text-red-300 flex items-center gap-3 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Frame"
            disabled={frames.length === 1}
          >
            <FaTrash className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default Timeline 