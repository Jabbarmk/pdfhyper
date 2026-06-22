export interface PageDimensions {
  width: number;
  height: number;
}

/**
 * Converts rectangle stored in normalized PDF points (Y from top)
 * to PDF export coordinates (Y from bottom-left origin per PDF spec).
 */
export function normToExportCoords(
  rect: { x: number; y: number; width: number; height: number },
  pageDim: PageDimensions
) {
  return {
    x: rect.x,
    y: pageDim.height - rect.y - rect.height,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Converts canvas pixel coordinates at a given scale
 * to normalized PDF points (Y from top, scale=1).
 */
export function canvasToNormCoords(
  rect: { x: number; y: number; width: number; height: number },
  scale: number
) {
  return {
    x: rect.x / scale,
    y: rect.y / scale,
    width: rect.width / scale,
    height: rect.height / scale,
  };
}
