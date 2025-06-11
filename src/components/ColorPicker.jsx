import { useState, useCallback, useMemo } from 'react';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import { hexToRgba } from '../utils/color';

const DEFAULT_COLORS = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff8000', '#8000ff', '#0080ff', '#ff0080', '#80ff00', '#00ff80',
  '#000000', '#404040', '#808080', '#c0c0c0', '#ffffff'
];

// Helper function to convert rgba to hex
const rgbaToHex = (rgba) => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return rgba; // Return original if not rgba format
  
  const [_, r, g, b] = match;
  return `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
};

const ColorPicker = ({ onColorSelect, leftColor, rightColor, layers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColor, setNewColor] = useState('#ff0000');

  const handleColorChange = useCallback((e, isRightClick = false) => {
    const color = e.target.value;
    const rgbaColor = hexToRgba(color);
    onColorSelect(rgbaColor, isRightClick ? 'right' : 'left');
  }, [onColorSelect]);

  // Get unique colors from all visible layers
  const activeColors = useMemo(() => {
    const colors = new Set();
    layers.forEach(layer => {
      if (!layer.visible) return;
      layer.pixels.forEach(row => {
        row.forEach(color => {
          if (color) colors.add(color);
        });
      });
    });
    return Array.from(colors);
  }, [layers]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-neutral-700">
        <h2 className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Colors</h2>
      </div>

      {/* Content */}
      <div className="p-3 flex-1">
        {/* Color Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs text-neutral-400 mb-1">Primary</label>
              <div className="relative">
                <input
                  type="color"
                  value={leftColor}
                  onChange={(e) => handleColorChange(e, false)}
                  className="w-full h-8 rounded cursor-pointer bg-neutral-800 border border-neutral-700"
                />
                <input
                  type="text"
                  value={leftColor}
                  onChange={(e) => handleColorChange(e, false)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-neutral-400 mb-1">Secondary</label>
              <div className="relative">
                <input
                  type="color"
                  value={rightColor}
                  onChange={(e) => handleColorChange(e, true)}
                  className="w-full h-8 rounded cursor-pointer bg-neutral-800 border border-neutral-700"
                />
                <input
                  type="text"
                  value={rightColor}
                  onChange={(e) => handleColorChange(e, true)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Active Colors */}
          <div>
            <h3 className="text-xs font-medium text-neutral-400 mb-2">Colors in Use</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {activeColors.map((color, index) => (
                <div
                  key={index}
                  className="group relative aspect-square rounded cursor-pointer overflow-hidden border border-neutral-700 hover:border-purple-500 transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange({ target: { value: color } }, false)}
                >
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      className="p-1 text-white hover:text-purple-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleColorChange({ target: { value: color } }, true);
                      }}
                    >
                      <FaPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker; 