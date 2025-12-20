import { useState, useEffect } from 'react'
import { FaMinus, FaSquare, FaTimes, FaWindowMaximize } from 'react-icons/fa'

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // Check initial maximized state
    if (window.electron?.isMaximized) {
      window.electron.isMaximized().then(setIsMaximized)
    }

    // Listen for maximize/unmaximize events
    if (window.electron?.onWindowMaximized) {
      window.electron.onWindowMaximized(() => setIsMaximized(true))
    }
    if (window.electron?.onWindowUnmaximized) {
      window.electron.onWindowUnmaximized(() => setIsMaximized(false))
    }
  }, [])

  const handleMinimize = () => {
    if (window.electron?.minimizeWindow) {
      window.electron.minimizeWindow()
    }
  }

  const handleMaximize = () => {
    if (window.electron?.maximizeWindow) {
      window.electron.maximizeWindow()
    }
  }

  const handleClose = () => {
    if (window.electron?.closeWindow) {
      window.electron.closeWindow()
    }
  }

  // Don't render if not in Electron
  if (!window.electron) {
    return null
  }

  return (
    <div 
      className="h-8 bg-neutral-900 flex items-center justify-between px-2 select-none" 
      style={{ WebkitAppRegion: 'drag', appRegion: 'drag' }}
    >
      <div className="flex items-center gap-2 px-2">
        <img src="/logo.png" alt="Dream Pixel" className="w-4 h-4" />
        <span className="text-xs text-neutral-400 font-medium">Dream Pixel Editor</span>
      </div>
      
      <div 
        className="flex items-center" 
        style={{ WebkitAppRegion: 'no-drag', appRegion: 'no-drag' }}
      >
        <button
          onClick={handleMinimize}
          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors rounded"
          title="Minimize"
        >
          <FaMinus className="w-3 h-3" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors rounded"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <FaSquare className="w-3 h-3" /> : <FaWindowMaximize className="w-3 h-3" />}
        </button>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:bg-red-600 hover:text-white transition-colors rounded"
          title="Close"
        >
          <FaTimes className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default TitleBar

