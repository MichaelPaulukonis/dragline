export function createBlock(usedIndices, clusterCenterX, clusterCenterY, blocks, fillChar, clusteringDistance, grid) {
  const allIndices = Array.from(Array(blocks.length).keys()) // Cache all indices
  const availableIndices = allIndices.filter(i => !usedIndices.has(i))

  if (availableIndices.length === 0) {
    console.warn('All indices have been used. Resetting usedIndices.')
    usedIndices.clear()
    availableIndices.push(...allIndices)
  }

  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
  usedIndices.add(randomIndex)

  // Retain the original lines without replacing spaces
  const lines = blocks[randomIndex]

  const width = Math.max(...lines.map(line => line.length))
  const height = lines.length

  const x = Math.max(
    0,
    Math.min(
      grid.cols - width,
      clusterCenterX + Math.floor((Math.random() - 0.5) * clusteringDistance)
    )
  )
  const y = Math.max(
    0,
    Math.min(
      grid.rows - height,
      clusterCenterY + Math.floor((Math.random() - 0.5) * clusteringDistance)
    )
  )

  return {
    index: randomIndex,
    lines: lines, // Keep the original lines
    x: x,
    y: y,
    w: width,
    h: height
  }
}

export function setupTextAreas(textAreas, blocks, blockCount, grid, fillChar, clusteringDistance) {
  const usedIndices = new Set(textAreas.map(area => area.index))

  const clusterCenterX = Math.floor(Math.random() * grid.cols)
  const clusterCenterY = Math.floor(Math.random() * grid.rows)

  const newTextAreas = [...textAreas]
  const blocksToAdd = blockCount - newTextAreas.length
  if (blocksToAdd > 0) {
    const newBlocks = Array(blocksToAdd)
      .fill()
      .map(() => createBlock(usedIndices, clusterCenterX, clusterCenterY, blocks, fillChar, clusteringDistance, grid))
    newTextAreas.push(...newBlocks)
  }

  return newTextAreas
}
