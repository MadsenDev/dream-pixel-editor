import { useState, useRef, useEffect } from 'react'
import { FaEye, FaEyeSlash, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaCopy, FaObjectGroup, FaObjectUngroup, FaCompress, FaEllipsisV } from 'react-icons/fa'

const LayersPanel = ({
  layers,
  activeLayer,
  onSelectLayer,
  onLayerAdd,
  onDeleteLayer,
  onToggleVisibility,
  onMoveLayer,
  onDuplicateLayer,
  onRenameLayer,
  onSetOpacity,
  onCreateGroup,
  onAddToGroup,
  onRemoveFromGroup,
  onMergeLayers
}) => {
  const [editingLayer, setEditingLayer] = useState(null)
  const [selectedLayers, setSelectedLayers] = useState(new Set())
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, layerIndex: null })
  const panelRef = useRef(null)
  const [draggedIdx, setDraggedIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu.show && !e.target.closest('.context-menu')) {
        setContextMenu(prev => ({ ...prev, show: false }))
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [contextMenu.show])

  const handleLayerClick = (idx, e) => {
    if (e.shiftKey) {
      setSelectedLayers(prev => {
        const newSelected = new Set(prev)
        if (newSelected.has(idx)) {
          newSelected.delete(idx)
        } else {
          newSelected.add(idx)
        }
        return newSelected
      })
    } else {
      setSelectedLayers(new Set([idx]))
      onSelectLayer(idx)
    }
  }

  const handleContextMenu = (e, idx) => {
    e.preventDefault()
    e.stopPropagation()

    // Get the bounding rect of the clicked layer item
    const item = e.currentTarget
    const rect = item.getBoundingClientRect()
    const menuHeight = 220 // Approximate height of the context menu
    const margin = 8
    let top = rect.bottom + window.scrollY
    let left = rect.left + window.scrollX

    // If menu would overflow bottom, show above
    if (top + menuHeight > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - menuHeight
    }
    // If menu would overflow right, adjust left
    const menuWidth = 200
    if (left + menuWidth > window.innerWidth + window.scrollX) {
      left = window.innerWidth + window.scrollX - menuWidth - margin
    }
    setContextMenu({
      show: true,
      x: left,
      y: top,
      layerIndex: idx
    })
  }

  const handleRenameSubmit = (e) => {
    if (e.key === 'Enter') {
      onRenameLayer(editingLayer, e.target.value)
      setEditingLayer(null)
    }
  }

  const handleMergeSelected = () => {
    if (selectedLayers.size >= 2) {
      onMergeLayers(Array.from(selectedLayers))
      setSelectedLayers(new Set())
    }
  }

  // Drag and drop handlers
  const handleDragStart = (idx) => setDraggedIdx(idx)
  const handleDragOver = (idx, e) => {
    e.preventDefault()
    setDragOverIdx(idx)
  }
  const handleDrop = (idx) => {
    if (draggedIdx !== null && draggedIdx !== idx) {
      onMoveLayer(draggedIdx, idx)
    }
    setDraggedIdx(null)
    setDragOverIdx(null)
  }
  const handleDragEnd = () => {
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-purple-300">Layers</h2>
        <div className="flex gap-1">
          <button
            className="p-1.5 rounded bg-neutral-700 hover:bg-purple-600 text-purple-300 hover:text-white transition-colors"
            onClick={onLayerAdd}
            title="Add Layer"
          >
            <FaPlus className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 rounded bg-neutral-700 hover:bg-purple-600 text-purple-300 hover:text-white transition-colors"
            onClick={handleMergeSelected}
            disabled={selectedLayers.size < 2}
            title="Merge Selected Layers"
          >
            <FaCompress className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {layers.map((layer, idx) => (
            <div
              key={layer.id}
              className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                idx === activeLayer ? 'bg-purple-900/40' : 
                selectedLayers.has(idx) ? 'bg-purple-900/20' : 'hover:bg-neutral-700/50'
              } ${dragOverIdx === idx && draggedIdx !== null ? 'ring-1 ring-purple-400' : ''}`}
              onClick={(e) => handleLayerClick(idx, e)}
              onContextMenu={(e) => handleContextMenu(e, idx)}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(idx, e)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
            >
              {/* Visibility Toggle */}
              <button
                className="p-1 text-purple-400 hover:text-purple-300 focus:outline-none"
                onClick={e => { e.stopPropagation(); onToggleVisibility(idx); }}
                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
              >
                {layer.visible ? <FaEye className="w-3.5 h-3.5" /> : <FaEyeSlash className="w-3.5 h-3.5" />}
              </button>

              {/* Layer Name */}
              {editingLayer === idx ? (
                <input
                  type="text"
                  defaultValue={layer.name}
                  className="flex-1 bg-neutral-800 text-white px-1.5 rounded text-sm w-full max-w-full overflow-hidden text-ellipsis"
                  onKeyDown={handleRenameSubmit}
                  onBlur={() => setEditingLayer(null)}
                  autoFocus
                />
              ) : (
                <span 
                  className="flex-1 truncate text-white text-sm"
                  onDoubleClick={() => setEditingLayer(idx)}
                >
                  {layer.name}
                </span>
              )}

              {/* Quick Actions */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 text-purple-400 hover:text-purple-300 focus:outline-none"
                  onClick={e => { e.stopPropagation(); onDuplicateLayer(idx); }}
                  title="Duplicate Layer"
                >
                  <FaCopy className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-1 text-red-400 hover:text-red-300 focus:outline-none"
                  onClick={e => { e.stopPropagation(); onDeleteLayer(idx); }}
                  title="Delete Layer"
                  disabled={layers.length === 1}
                >
                  <FaTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div 
          className="context-menu fixed bg-neutral-800 rounded-md shadow-lg border border-neutral-700 py-1 z-50"
          style={{ 
            left: contextMenu.x,
            top: contextMenu.y,
            minWidth: '200px',
            maxWidth: '200px'
          }}
        >
          <button
            className="w-full px-3 py-1.5 text-left text-purple-300 hover:bg-neutral-700 flex items-center gap-2 text-sm"
            onClick={() => {
              onMoveLayer(contextMenu.layerIndex, 'up')
              setContextMenu(prev => ({ ...prev, show: false }))
            }}
            disabled={contextMenu.layerIndex === 0}
          >
            <FaArrowUp className="w-3.5 h-3.5" /> Move Up
          </button>
          <button
            className="w-full px-3 py-1.5 text-left text-purple-300 hover:bg-neutral-700 flex items-center gap-2 text-sm"
            onClick={() => {
              onMoveLayer(contextMenu.layerIndex, 'down')
              setContextMenu(prev => ({ ...prev, show: false }))
            }}
            disabled={contextMenu.layerIndex === layers.length - 1}
          >
            <FaArrowDown className="w-3.5 h-3.5" /> Move Down
          </button>
          <button
            className="w-full px-3 py-1.5 text-left text-purple-300 hover:bg-neutral-700 flex items-center gap-2 text-sm"
            onClick={() => {
              setEditingLayer(contextMenu.layerIndex)
              setContextMenu(prev => ({ ...prev, show: false }))
            }}
          >
            Rename
          </button>
          <div className="px-3 py-1.5 text-purple-300 flex items-center gap-2 text-sm">
            <span>Opacity:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={layers[contextMenu.layerIndex].opacity * 100}
              onChange={e => onSetOpacity(contextMenu.layerIndex, e.target.value / 100)}
              className="w-24"
            />
          </div>
          {layers[contextMenu.layerIndex].groupId ? (
            <button
              className="w-full px-3 py-1.5 text-left text-purple-300 hover:bg-neutral-700 flex items-center gap-2 text-sm"
              onClick={() => {
                onRemoveFromGroup(contextMenu.layerIndex)
                setContextMenu(prev => ({ ...prev, show: false }))
              }}
            >
              <FaObjectUngroup className="w-3.5 h-3.5" /> Remove from Group
            </button>
          ) : (
            <button
              className="w-full px-3 py-1.5 text-left text-purple-300 hover:bg-neutral-700 flex items-center gap-2 text-sm"
              onClick={() => {
                onCreateGroup()
                setContextMenu(prev => ({ ...prev, show: false }))
              }}
            >
              <FaObjectGroup className="w-3.5 h-3.5" /> Create Group
            </button>
          )}
          <button
            className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-neutral-700 flex items-center gap-2 text-sm"
            onClick={() => {
              onDeleteLayer(contextMenu.layerIndex)
              setContextMenu(prev => ({ ...prev, show: false }))
            }}
            disabled={layers.length === 1}
          >
            <FaTrash className="w-3.5 h-3.5" /> Delete Layer
          </button>
        </div>
      )}
    </div>
  )
}

export default LayersPanel 