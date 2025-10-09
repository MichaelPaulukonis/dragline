import { setActiveRatio, handleRatioPresetClick, createSelectionState } from '../src/selection.js'

describe('ratio preset functionality', () => {
  const grid = { cols: 40, rows: 30, cellSize: 15 }
  let selectionState

  beforeEach(() => {
    selectionState = createSelectionState(grid)
    selectionState.isActive = true
    selectionState.bounds = { x: 10, y: 10, w: 8, h: 6 }
  })

  describe('setActiveRatio', () => {
    it('applies square ratio by expanding height', () => {
      setActiveRatio(selectionState, 1) // 1:1 ratio
      
      expect(selectionState.activeRatio.label).toBe('1:1')
      expect(selectionState.bounds.w).toBe(8)
      expect(selectionState.bounds.h).toBe(8) // Expanded from 6 to 8
    })

    it('applies 16:9 ratio by expanding width', () => {
      selectionState.bounds = { x: 10, y: 10, w: 4, h: 8 }
      setActiveRatio(selectionState, 5) // 16:9 ratio
      
      expect(selectionState.activeRatio.label).toBe('16:9')
      expect(selectionState.bounds.h).toBe(8)
      expect(selectionState.bounds.w).toBeCloseTo(14, 0) // 8 * 16/9 ≈ 14.22
    })

    it('handles freeform ratio without constraints', () => {
      const originalBounds = { ...selectionState.bounds }
      setActiveRatio(selectionState, 0) // Free ratio
      
      expect(selectionState.activeRatio.label).toBe('Free')
      expect(selectionState.bounds).toEqual(originalBounds)
    })
  })

  describe('handleRatioPresetClick', () => {
    it('detects clicks on ratio preset buttons', () => {
      const buttonWidth = 45
      const buttonHeight = 24
      const margin = 8
      const startX = 20
      const startY = 20
      
      // Click on first button (Free)
      const clickX = startX + buttonWidth / 2
      const clickY = startY + buttonHeight / 2
      
      const handled = handleRatioPresetClick(selectionState, clickX, clickY)
      
      expect(handled).toBe(true)
      expect(selectionState.activeRatio.label).toBe('Free')
    })

    it('returns false for clicks outside button areas', () => {
      const handled = handleRatioPresetClick(selectionState, 5, 5)
      expect(handled).toBe(false)
    })

    it('ignores clicks when selection is not active', () => {
      selectionState.isActive = false
      const handled = handleRatioPresetClick(selectionState, 35, 32)
      expect(handled).toBe(false)
    })
  })
})