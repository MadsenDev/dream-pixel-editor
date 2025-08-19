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
  showOnionSkin,
  onToggleOnionSkin,
  spriteSize,
  settings
}) => {
  const [menuIdx, setMenuIdx] = useState(null)
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0 })
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
      canvas.width = width
      canvas.height = height
      ctx.clearRect(0, 0, width, height)
      frame.layers.forEach(layer => {
        if (!layer.visible) return
        ctx.globalAlpha = layer.opacity
        for (let y = 0; y < layer.pixels.length; y++) {
          for (let x = 0; x < layer.pixels[y].length; x++) {
            const color = layer.pixels[y][x]
            if (color) {
              ctx.fillStyle = color
              ctx.fillRect(x, y, 1, 1)
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

  return (
    <div className="w-full min-w-0 flex flex-col bg-neutral-800 border-t border-neutral-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <h2 className="text-sm font-semibold text-purple-300">Timeline</h2>
        <div className="flex items-center gap-1">
          <button
            className={`p-1.5 rounded transition-colors ${
              showOnionSkin ? 'bg-purple-600 text-white' : 'bg-neutral-700 text-purple-300 hover:bg-purple-600 hover:text-white'
            }`}
            onClick={onToggleOnionSkin}
            title="Toggle Onion Skin"
          >
            <FaEye className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 rounded bg-neutral-700 hover:bg-purple-600 text-purple-300 hover:text-white transition-colors"
            onClick={onAddFrame}
            title="Add Frame"
          >
            <FaPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frames */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full min-w-0">
          {frames.map((frame, idx) => (
            <div 
              key={frame.id} 
              className={`relative flex flex-col items-center group ${
                idx === activeFrame ? 'ring-2 ring-purple-400' : 'hover:ring-2 hover:ring-purple-300'
              } rounded-lg transition-all`}
            >
              <button
                onClick={() => onSelectFrame(idx)}
                className="w-14 h-14 bg-neutral-700 border border-neutral-600 rounded-lg shadow flex items-center justify-center overflow-hidden"
                style={{ outline: 'none' }}
                tabIndex={0}
                title={`Frame ${idx + 1}`}
              >
                <canvas
                  ref={el => canvasRefs.current[idx] = el}
                  style={{ 
                    width: 40, 
                    height: 40, 
                    imageRendering: 'pixelated', 
                    background: settings.backgroundColor 
                  }}
                />
              </button>
              {/* Frame options menu trigger */}
              <button
                ref={el => btnRefs.current[idx] = el}
                className="frame-options-btn absolute top-1 right-1 p-1 text-purple-400 hover:text-purple-300 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                title="Frame Options"
                onClick={(e) => handleMenuOpen(idx, e)}
              >
                <FaEllipsisV className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {menuIdx !== null && (
        <div
          ref={menuRef}
          className="fixed bg-neutral-800 border border-neutral-700 rounded-md shadow-lg z-50"
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
            className="w-full px-3 py-1.5 text-left text-purple-300 hover:bg-neutral-700 flex items-center gap-2 text-sm"
            title="Duplicate Frame"
          >
            <FaCopy className="w-3.5 h-3.5" /> Duplicate
          </button>
          <button
            onClick={() => { onDeleteFrame(menuIdx); setMenuIdx(null) }}
            className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-neutral-700 flex items-center gap-2 text-sm"
            title="Delete Frame"
            disabled={frames.length === 1}
          >
            <FaTrash className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default Timeline 