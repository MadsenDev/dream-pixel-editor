import { useState, useEffect } from 'react'
import { FaTimes, FaPalette, FaFilm, FaTools, FaDesktop, FaFileExport, FaTachometerAlt } from 'react-icons/fa'

const TABS = [
  { id: 'canvas', label: 'Canvas', icon: FaPalette },
  { id: 'animation', label: 'Animation', icon: FaFilm },
  { id: 'tools', label: 'Tools', icon: FaTools },
  { id: 'interface', label: 'Interface', icon: FaDesktop },
  { id: 'export', label: 'Export', icon: FaFileExport },
  { id: 'performance', label: 'Performance', icon: FaTachometerAlt }
]

const SettingsModal = ({ settings, onSettingsChange, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings)
  const [activeTab, setActiveTab] = useState('canvas')

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'canvas':
        return (
          <div className="space-y-4">
            {/* Grid Size */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Grid Size</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Width</label>
                  <input
                    type="number"
                    min="1"
                    max="256"
                    value={localSettings.gridWidth}
                    onChange={e => handleChange('gridWidth', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Height</label>
                  <input
                    type="number"
                    min="1"
                    max="256"
                    value={localSettings.gridHeight}
                    onChange={e => handleChange('gridHeight', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Grid Options */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Grid Options</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Show Grid</span>
                  <button
                    onClick={() => handleChange('showGrid', !localSettings.showGrid)}
                    className={`p-2 rounded-lg hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      localSettings.showGrid ? 'bg-purple-900/40 text-white' : ''
                    }`}
                  >
                    {localSettings.showGrid ? 'On' : 'Off'}
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Grid Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localSettings.gridOpacity * 100}
                    onChange={e => handleChange('gridOpacity', parseInt(e.target.value) / 100)}
                    className="w-full accent-purple-500 bg-neutral-700 h-1 rounded-full"
                  />
                  <div className="flex justify-between text-xs text-neutral-400 mt-1">
                    <span>0%</span>
                    <span>{Math.round(localSettings.gridOpacity * 100)}%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Grid Color</label>
                  <input
                    type="color"
                    value={localSettings.gridColor}
                    onChange={e => handleChange('gridColor', e.target.value)}
                    className="w-full h-8 rounded cursor-pointer bg-neutral-700 border border-neutral-600"
                  />
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Background Color</label>
              <input
                type="color"
                value={localSettings.backgroundColor}
                onChange={e => handleChange('backgroundColor', e.target.value)}
                className="w-full h-8 rounded cursor-pointer bg-neutral-700 border border-neutral-600"
              />
            </div>
          </div>
        )

      case 'animation':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Default FPS</label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.defaultFps || 6}
                onChange={e => handleChange('defaultFps', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Onion Skin</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Show by Default</span>
                  <button
                    onClick={() => handleChange('defaultShowOnionSkin', !localSettings.defaultShowOnionSkin)}
                    className={`p-2 rounded-lg hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      localSettings.defaultShowOnionSkin ? 'bg-purple-900/40 text-white' : ''
                    }`}
                  >
                    {localSettings.defaultShowOnionSkin ? 'On' : 'Off'}
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={(localSettings.onionSkinOpacity || 0.3) * 100}
                    onChange={e => handleChange('onionSkinOpacity', parseInt(e.target.value) / 100)}
                    className="w-full accent-purple-500 bg-neutral-700 h-1 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Default Playback</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Mode</span>
                  <select
                    value={localSettings.defaultPlaybackMode || 'loop'}
                    onChange={e => handleChange('defaultPlaybackMode', e.target.value)}
                    className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="loop">Loop</option>
                    <option value="pingPong">Ping Pong</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'tools':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Default Tool Options</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Perfect Shapes</span>
                  <button
                    onClick={() => handleChange('defaultPerfectShapes', !localSettings.defaultPerfectShapes)}
                    className={`p-2 rounded-lg hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      localSettings.defaultPerfectShapes ? 'bg-purple-900/40 text-white' : ''
                    }`}
                  >
                    {localSettings.defaultPerfectShapes ? 'On' : 'Off'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Fill Mode</span>
                  <button
                    onClick={() => handleChange('defaultFillMode', !localSettings.defaultFillMode)}
                    className={`p-2 rounded-lg hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      localSettings.defaultFillMode ? 'bg-purple-900/40 text-white' : ''
                    }`}
                  >
                    {localSettings.defaultFillMode ? 'On' : 'Off'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Draw from Center</span>
                  <button
                    onClick={() => handleChange('defaultDrawFromCenter', !localSettings.defaultDrawFromCenter)}
                    className={`p-2 rounded-lg hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      localSettings.defaultDrawFromCenter ? 'bg-purple-900/40 text-white' : ''
                    }`}
                  >
                    {localSettings.defaultDrawFromCenter ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Default Colors</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Primary</label>
                  <input
                    type="color"
                    value={localSettings.defaultLeftColor || '#ff0000'}
                    onChange={e => handleChange('defaultLeftColor', e.target.value)}
                    className="w-full h-8 rounded cursor-pointer bg-neutral-700 border border-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Secondary</label>
                  <input
                    type="color"
                    value={localSettings.defaultRightColor || '#0000ff'}
                    onChange={e => handleChange('defaultRightColor', e.target.value)}
                    className="w-full h-8 rounded cursor-pointer bg-neutral-700 border border-neutral-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'interface':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Theme</label>
              <select
                value={localSettings.theme || 'dark'}
                onChange={e => handleChange('theme', e.target.value)}
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">UI Scale</label>
              <input
                type="range"
                min="80"
                max="120"
                step="10"
                value={localSettings.uiScale || 100}
                onChange={e => handleChange('uiScale', parseInt(e.target.value))}
                className="w-full accent-purple-500 bg-neutral-700 h-1 rounded-full"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>80%</span>
                <span>{localSettings.uiScale || 100}%</span>
                <span>120%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Default Zoom</label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={(localSettings.defaultZoom || 1) * 100}
                onChange={e => handleChange('defaultZoom', parseInt(e.target.value) / 100)}
                className="w-full accent-purple-500 bg-neutral-700 h-1 rounded-full"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>10%</span>
                <span>{Math.round((localSettings.defaultZoom || 1) * 100)}%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Visible Panels</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Toolbar</span>
                  <button
                    onClick={() => handleChange('showToolbar', !localSettings.showToolbar)}
                    className={`p-2 rounded-lg hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      localSettings.showToolbar ? 'bg-purple-900/40 text-white' : ''
                    }`}
                  >
                    {localSettings.showToolbar ? 'Show' : 'Hide'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Layers Panel</span>
                  <button
                    onClick={() => handleChange('showLayersPanel', !localSettings.showLayersPanel)}
                    className={`p-2 rounded-lg hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      localSettings.showLayersPanel ? 'bg-purple-900/40 text-white' : ''
                    }`}
                  >
                    {localSettings.showLayersPanel ? 'Show' : 'Hide'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Timeline</span>
                  <button
                    onClick={() => handleChange('showTimeline', !localSettings.showTimeline)}
                    className={`p-2 rounded-lg hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      localSettings.showTimeline ? 'bg-purple-900/40 text-white' : ''
                    }`}
                  >
                    {localSettings.showTimeline ? 'Show' : 'Hide'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'export':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Default Export Settings</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Scale</label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={localSettings.defaultExportScale || 1}
                    onChange={e => handleChange('defaultExportScale', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Format</label>
                  <select
                    value={localSettings.defaultExportFormat || 'png'}
                    onChange={e => handleChange('defaultExportFormat', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="png">PNG</option>
                    <option value="gif">GIF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Mode</label>
                  <select
                    value={localSettings.defaultExportMode || 'single'}
                    onChange={e => handleChange('defaultExportMode', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="single">Single Frame</option>
                    <option value="spriteSheet">Sprite Sheet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Frames Per Row</label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={localSettings.defaultFramesPerRow || 4}
                    onChange={e => handleChange('defaultFramesPerRow', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'performance':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Rendering Quality</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Canvas Quality</label>
                  <select
                    value={localSettings.canvasQuality || 'high'}
                    onChange={e => handleChange('canvasQuality', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Preview Quality</label>
                  <select
                    value={localSettings.previewQuality || 'medium'}
                    onChange={e => handleChange('previewQuality', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Cache Settings</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Enable Caching</span>
                  <button
                    onClick={() => handleChange('enableCaching', !localSettings.enableCaching)}
                    className={`p-2 rounded-lg hover:bg-neutral-600 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      localSettings.enableCaching ? 'bg-purple-900/40 text-white' : ''
                    }`}
                  >
                    {localSettings.enableCaching ? 'On' : 'Off'}
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Cache Size (MB)</label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    step="50"
                    value={localSettings.cacheSize || 200}
                    onChange={e => handleChange('cacheSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg shadow-xl w-[600px] max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Tabs */}
          <div className="w-48 border-r border-neutral-700 bg-neutral-900/50">
            <div className="p-2 space-y-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-900/40 text-white'
                      : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {renderTabContent()}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal 