export const createCharGrid = (rows, cols, fillChar) => {
  return Array(rows)
    .fill()
    .map(() => Array(cols).fill(fillChar))
}

export const populateCharGrid = (charGrid, textAreas, fillChar, withinGrid) => {
  // Reset the entire grid to the fill character
  for (let y = 0; y < charGrid.length; y++) {
    for (let x = 0; x < charGrid[y].length; x++) {
      charGrid[y][x] = fillChar
    }
  }

  // Populate the grid with the current positions of text areas
  for (let area of textAreas) {
    for (let i = 0; i < area.lines.length; i++) {
      const line = area.lines[i]
      for (let j = 0; j < line.length; j++) {
        if (line[j] === fillChar) continue

        if (
          withinGrid(area, i, j) &&
          charGrid[area.y + i][area.x + j] === fillChar &&
          line[j] !== ' '
        ) {
          charGrid[area.y + i][area.x + j] = line[j]
        }
      }
    }
  }
}

export const renderCharGrid = (charGrid, p, grid, fillChar) => {
  for (let y = 0; y < charGrid.length; y++) {
    for (let x = 0; x < charGrid[y].length; x++) {
      const canvasX = x * grid.cellSize
      const canvasY = y * grid.cellSize
      p.text(charGrid[y][x], canvasX, canvasY)
    }
  }
}
