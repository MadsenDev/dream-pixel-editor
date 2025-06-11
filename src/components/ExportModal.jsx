import React, { useState } from 'react'

const ExportModal = ({ isOpen, onClose, onExport, frames }) => {
  const [mode, setMode] = useState('single') // 'single' or 'sheet'
  const [scale, setScale] = useState(1)
  const [framesPerRow, setFramesPerRow] = useState(4)
  const [exportAllFrames, setExportAllFrames] = useState(true)

  const handleExport = () => {
    onExport({
      mode,
      scale,
      framesPerRow,
      exportAllFrames
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Export</h2>
        
        {/* Export Mode Selection */}
        <div className="mb-4 flex gap-2">
          <button
            className={`px-3 py-1 rounded-l ${mode === 'single' ? 'bg-cyan-600 text-white' : 'bg-neutral-700 text-gray-300'}`}
            onClick={() => setMode('single')}
          >
            Single Frame
          </button>
          <button
            className={`px-3 py-1 rounded-r ${mode === 'sheet' ? 'bg-cyan-600 text-white' : 'bg-neutral-700 text-gray-300'}`}
            onClick={() => setMode('sheet')}
          >
            Sprite Sheet
          </button>
        </div>

        {/* Scale Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Scale</label>
          <select
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
          >
            <option value={1}>1x (1 cell = 1 pixel)</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
            <option value={8}>8x</option>
          </select>
        </div>

        {/* Sprite Sheet Options */}
        {mode === 'sheet' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Frames per Row</label>
              <input
                type="number"
                min={1}
                value={framesPerRow}
                onChange={e => setFramesPerRow(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <input
                  type="checkbox"
                  checked={exportAllFrames}
                  onChange={e => setExportAllFrames(e.target.checked)}
                  className="rounded border-neutral-700 text-cyan-600 focus:ring-cyan-500"
                />
                Export All Frames
              </label>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-colors"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal 