/**
 * Converts a hex color code to rgba format
 * @param {string} hex - Hex color code (e.g. '#ff0000')
 * @param {number} alpha - Alpha value between 0 and 1 (default: 1)
 * @returns {string} rgba color string
 */
export const hexToRgba = (hex, alpha = 1) => {
  // Remove the hash if present
  hex = hex.replace('#', '');

  // Parse the hex values
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Return rgba string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Converts an rgba color string to hex format
 * @param {string} rgba - rgba color string (e.g. 'rgba(255, 0, 0, 1)')
 * @returns {string} hex color code
 */
export const rgbaToHex = (rgba) => {
  // Extract the rgb values
  const rgb = rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!rgb) return '#000000';

  // Convert to hex
  const r = Number(rgb[1]).toString(16).padStart(2, '0');
  const g = Number(rgb[2]).toString(16).padStart(2, '0');
  const b = Number(rgb[3]).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}; 