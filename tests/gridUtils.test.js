import { clampBoundsToGrid, gridBoundsToPixels, pixelsToGridCoordinates } from '../src/grid.js'

describe('grid helpers', () => {
  const grid = { cols: 40, rows: 30, cellSize: 10 }

  it('converts grid bounds to pixel rectangle', () => {
    const pixels = gridBoundsToPixels({ x: 2, y: 3, w: 5, h: 4 }, grid.cellSize)
    expect(pixels).toEqual({ x: 20, y: 30, width: 50, height: 40 })
  })

  it('derives fractional grid coordinates from pixel values', () => {
    const { col, row } = pixelsToGridCoordinates(45, 85, grid.cellSize)
    expect(col).toBeCloseTo(4.5)
    expect(row).toBeCloseTo(8.5)
  })

  it('clamps bounds so they remain within the grid domain', () => {
    const bounds = clampBoundsToGrid({ x: 38, y: 28, w: 5, h: 6 }, grid)
    expect(bounds).toEqual({ x: 35, y: 24, w: 5, h: 6 })
  })
})
