import { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'

const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    onSettingsChange(localSettings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-xl font-semibold text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Grid Size */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Grid Size</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Width</label>
                <input
                  type="number"
                  min="1"
                  max="256"
                  value={localSettings.gridWidth}
                  onChange={(e) => handleChange('gridWidth', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Height</label>
                <input
                  type="number"
                  min="1"
                  max="256"
                  value={localSettings.gridHeight}
                  onChange={(e) => handleChange('gridHeight', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={localSettings.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={localSettings.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Grid Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Grid Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={localSettings.gridColor}
                onChange={(e) => handleChange('gridColor', e.target.value)}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={localSettings.gridColor}
                onChange={(e) => handleChange('gridColor', e.target.value)}
                className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Grid Opacity */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Grid Opacity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={localSettings.gridOpacity}
              onChange={(e) => handleChange('gridOpacity', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-right">{localSettings.gridOpacity}%</div>
          </div>

          {/* Pixel Size */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Default Pixel Size</label>
            <input
              type="number"
              min="1"
              max="64"
              value={localSettings.defaultPixelSize}
              onChange={(e) => handleChange('defaultPixelSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="p-4 border-t border-neutral-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal 