import React, { useState, useRef } from 'react'
import { importPngToFrame, importSpriteSheetToFrames } from '../utils/importPng'

const ImportModal = ({ isOpen, onClose, onImportFrame, onImportFrames }) => {
  const [mode, setMode] = useState('single') // 'single' or 'sheet'
  const [file, setFile] = useState(null)
  const [rows, setRows] = useState(1)
  const [cols, setCols] = useState(1)
  const [cellWidth, setCellWidth] = useState(16)
  const [cellHeight, setCellHeight] = useState(16)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [imgUrl, setImgUrl] = useState(null)
  const [imgDimensions, setImgDimensions] = useState({ width: 1, height: 1 })
  const imgRef = useRef(null)

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    setFile(f)
    setError('')
    if (f) {
      const url = URL.createObjectURL(f)
      setImgUrl(url)
    } else {
      setImgUrl(null)
    }
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      if (mode === 'single') {
        const { frame, width, height } = await importPngToFrame(file)
        onImportFrame({ frame, width, height })
      } else {
        const { frames, width, height } = await importSpriteSheetToFrames(file, { rows, cols, cellWidth, cellHeight })
        onImportFrames({ frames, width, height })
      }
      setLoading(false)
      onClose()
    } catch (err) {
      setError('Import failed. Please check your file and settings.')
      setLoading(false)
    }
  }

  // Draw grid overlay for sprite sheet preview
  const renderGridOverlay = () => {
    if (!imgUrl || mode !== 'sheet') return null
    return (
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {/* Vertical lines */}
          {Array.from({ length: cols + 1 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${(i * 100) / cols}%`}
              y1="0"
              x2={`${(i * 100) / cols}%`}
              y2="100%"
              stroke="#00ffff88"
              strokeWidth={1}
            />
          ))}
          {/* Horizontal lines */}
          {Array.from({ length: rows + 1 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={`${(i * 100) / rows}%`}
              x2="100%"
              y2={`${(i * 100) / rows}%`}
              stroke="#00ffff88"
              strokeWidth={1}
            />
          ))}
        </svg>
      </div>
    )
  }

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-xl font-semibold text-cyan-200 mb-4">Import Image</h2>
        <div className="mb-4 flex gap-2">
          <button
            className={`px-3 py-1 rounded-l ${mode === 'single' ? 'bg-cyan-600 text-white' : 'bg-neutral-700 text-gray-300'}`}
            onClick={() => setMode('single')}
          >
            Single Image
          </button>
          <button
            className={`px-3 py-1 rounded-r ${mode === 'sheet' ? 'bg-cyan-600 text-white' : 'bg-neutral-700 text-gray-300'}`}
            onClick={() => setMode('sheet')}
          >
            Sprite Sheet
          </button>
        </div>
        <div className="mb-4">
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        {mode === 'sheet' && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            <label className="flex flex-col text-gray-200 text-xs">Rows
              <input type="number" min={1} value={rows} onChange={e => setRows(Number(e.target.value))} className="bg-neutral-700 rounded px-2 py-1 mt-1" />
            </label>
            <label className="flex flex-col text-gray-200 text-xs">Columns
              <input type="number" min={1} value={cols} onChange={e => setCols(Number(e.target.value))} className="bg-neutral-700 rounded px-2 py-1 mt-1" />
            </label>
            <label className="flex flex-col text-gray-200 text-xs">Cell Width
              <input type="number" min={1} value={cellWidth} onChange={e => setCellWidth(Number(e.target.value))} className="bg-neutral-700 rounded px-2 py-1 mt-1" />
            </label>
            <label className="flex flex-col text-gray-200 text-xs">Cell Height
              <input type="number" min={1} value={cellHeight} onChange={e => setCellHeight(Number(e.target.value))} className="bg-neutral-700 rounded px-2 py-1 mt-1" />
            </label>
          </div>
        )}
        {imgUrl && (
          <div
            className="relative w-full mb-4 flex items-center justify-center overflow-hidden"
            style={{ background: '#222', borderRadius: 8, maxHeight: '50vh' }}
          >
            <div className="relative w-full" style={{ maxWidth: imgDimensions.width ? imgDimensions.width : '100%', maxHeight: '50vh' }}>
              <img
                ref={imgRef}
                src={imgUrl}
                alt="Preview"
                className="w-full h-auto object-contain"
                style={{ maxHeight: '50vh', display: 'block', margin: '0 auto' }}
                onLoad={e => {
                  const { naturalWidth, naturalHeight } = e.target
                  setImgDimensions({ width: naturalWidth, height: naturalHeight })
                  if (imgRef.current && imgRef.current.naturalWidth) {
                    setCellWidth(Math.floor(imgRef.current.naturalWidth / cols))
                  }
                }}
              />
              <div
                className="absolute inset-0"
                style={{ pointerEvents: 'none' }}
              >
                {renderGridOverlay()}
              </div>
            </div>
          </div>
        )}
        {error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-100 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-colors"
            disabled={loading || !file}
          >
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  ) : null
}

export default ImportModal 