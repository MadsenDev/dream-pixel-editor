import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';

const DEFAULT_COLORS = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff8000', '#8000ff', '#0080ff', '#ff0080', '#80ff00', '#00ff80',
  '#000000', '#404040', '#808080', '#c0c0c0', '#ffffff'
];

const ColorPicker = ({ onColorSelect, pixelData, currentTool, toolOptions, onToolOptionsChange, leftColor, rightColor }) => {
  const [showColorModal, setShowColorModal] = useState(false);
  const [activeColors, setActiveColors] = useState(['#ff0000', '#00ff00', '#0000ff']);

  useEffect(() => {
    if (!pixelData) return;
    
    const uniqueColors = new Set();
    pixelData.forEach(row => {
      row.forEach(color => {
        if (color) uniqueColors.add(color);
      });
    });
    setActiveColors(Array.from(uniqueColors));
  }, [pixelData]);

  const handleColorChange = (e, isRightClick = false) => {
    const color = e.target.value;
    onColorSelect(color, isRightClick ? 'right' : 'left');
  };

  const handleAddColor = () => {
    const colorToAdd = leftColor; // or rightColor, depending on which one was last modified
    if (!activeColors.includes(colorToAdd)) {
      setActiveColors(prev => [...prev, colorToAdd]);
    }
    setShowColorModal(false);
  };

  const handleColorSelect = (color, button) => {
    onColorSelect(color, button);
    if (!activeColors.includes(color)) {
      setActiveColors(prev => [...prev, color]);
    }
  };

  const handleToolOptionChange = (option) => {
    onToolOptionsChange(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const renderToolOptions = () => {
    if (!toolOptions) return null;
    
    switch (currentTool) {
      case 'rectangle':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-100">Rectangle Options</h3>
            <div className="flex flex-col gap-2 p-2 bg-neutral-900 rounded">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Filled</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={toolOptions.filled}
                    onChange={() => handleToolOptionChange('filled')}
                  />
                  <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Perfect Square</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={toolOptions.perfectShapes}
                    onChange={() => handleToolOptionChange('perfectShapes')}
                  />
                  <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Draw from Center</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={toolOptions.drawFromCenter}
                    onChange={() => handleToolOptionChange('drawFromCenter')}
                  />
                  <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
            </div>
          </div>
        );
      case 'circle':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-100">Circle Options</h3>
            <div className="flex flex-col gap-2 p-2 bg-neutral-900 rounded">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Filled</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={toolOptions.filled}
                    onChange={() => handleToolOptionChange('filled')}
                  />
                  <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Perfect Circle</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={toolOptions.perfectShapes}
                    onChange={() => handleToolOptionChange('perfectShapes')}
                  />
                  <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Draw from Center</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={toolOptions.drawFromCenter}
                    onChange={() => handleToolOptionChange('drawFromCenter')}
                  />
                  <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
            </div>
          </div>
        );
      case 'line':
        return (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-100">Line Options</h3>
            <div className="flex flex-col gap-2 p-2 bg-neutral-900 rounded">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Perfect Line</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={toolOptions.perfectShapes}
                    onChange={() => handleToolOptionChange('perfectShapes')}
                  />
                  <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-neutral-800 rounded-lg shadow-lg">
      {/* Color Selection */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-100">Color Selection</h3>
          <button
            onClick={() => setShowColorModal(true)}
            className="p-1 text-gray-400 hover:text-gray-100 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Left/Right Color Selection */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Left Click</label>
            <input
              type="color"
              value={leftColor}
              onChange={(e) => handleColorChange(e, false)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Right Click</label>
            <input
              type="color"
              value={rightColor}
              onChange={(e) => handleColorChange(e, true)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Active Colors */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-100">Active Colors</h3>
        <div className="grid grid-cols-4 gap-2">
          {activeColors.map((color, index) => (
            <button
              key={index}
              onClick={() => handleColorSelect(color, 'left')}
              onContextMenu={(e) => {
                e.preventDefault();
                handleColorSelect(color, 'right');
              }}
              className="w-8 h-8 rounded border border-neutral-700 hover:border-neutral-500 transition-colors"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Tool Options */}
      {renderToolOptions()}

      {/* Color Modal */}
      {showColorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Add Color</h3>
            <div className="flex flex-col gap-4">
              <input
                type="color"
                value={leftColor}
                onChange={(e) => handleColorChange(e, false)}
                className="w-full h-12 rounded cursor-pointer"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowColorModal(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddColor}
                  className="px-4 py-2 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker; 