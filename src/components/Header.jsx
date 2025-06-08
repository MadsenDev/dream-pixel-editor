import { FaCog, FaFileImport, FaSearch } from 'react-icons/fa'

const Header = ({ isImporting, onImport, onSettingsClick }) => {
  return (
    <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 shadow-lg border-b border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Title and Search */}
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Pixel Art Editor
              </h1>
            </div>
            <div className="hidden md:block ml-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search sprites..."
                  className="block w-64 pl-10 pr-3 py-2 border border-neutral-700 rounded-md bg-neutral-800 text-neutral-300 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onSettingsClick}
              className="inline-flex items-center px-3 py-2 border border-neutral-700 rounded-md text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-cyan-500 transition-colors"
            >
              <FaCog className="h-4 w-4 mr-2" />
              Settings
            </button>
            <label
              className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-cyan-500 transition-colors cursor-pointer ${
                isImporting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaFileImport className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import PNG'}
              <input
                type="file"
                accept=".png"
                onChange={onImport}
                className="hidden"
                disabled={isImporting}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header 