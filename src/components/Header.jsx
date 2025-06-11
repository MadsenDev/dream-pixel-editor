import { FaCog, FaFileImport, FaFileExport } from 'react-icons/fa'

const Header = ({ onImport, onExport, onSettings }) => {
  return (
    <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 shadow-lg border-b border-neutral-700">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
                <img src="/logo.png" alt="Dream Pixel Logo" className="w-8 h-8 mr-2" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Dream Pixel
                </h1>
                <p className="text-xs text-neutral-400 -mt-1">Pixel Art Animation Studio</p>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onImport}
              className="inline-flex items-center justify-center w-10 h-10 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-purple-500 transition-all duration-200"
              title="Import PNG"
            >
              <FaFileImport className="h-5 w-5" />
            </button>
            <button
              onClick={onExport}
              className="inline-flex items-center justify-center w-10 h-10 border border-neutral-700 rounded-md text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-purple-500 transition-all duration-200"
              title="Export"
            >
              <FaFileExport className="h-5 w-5" />
            </button>
            <button
              onClick={onSettings}
              className="inline-flex items-center justify-center w-10 h-10 border border-neutral-700 rounded-md text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-purple-500 transition-all duration-200"
              title="Settings"
            >
              <FaCog className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header 