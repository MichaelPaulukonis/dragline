import { buildGrid } from '../src/text-grid/gridBuilder'

describe('buildGrid', () => {
  test('should create a single grid when all tokens fit', () => {
    const tokens = ['hello', 'world', 'test']
    const grids = buildGrid(tokens, 0.5)

    // Ensure only one grid is created
    expect(grids.length).toBe(1)

    // Ensure all tokens are present in the grid
    // this may fail, since spacing can result in split tokens
    const gridString = grids[0].join('')
    tokens.forEach(token => {
      expect(gridString).toContain(token)
    })
  })

  test('should create multiple grids when tokens exceed one grid', () => {
    const tokens = Array(200).fill('longtoken') // Too many tokens for one grid
    const grids = buildGrid(tokens, 0.5)

    // Ensure multiple grids are created
    expect(grids.length).toBeGreaterThan(1)

    // Ensure all tokens are placed across grids
    // except ... all tokens are identical, so we don't know that ALL are present.
    // count them? count them!
    const allGridsString = grids.map(grid => grid.join('\n')).join('\n')
    tokens.forEach(token => {
      expect(allGridsString).toContain(token)
    })
  })

  test('should split tokens across lines if they exceed the row boundary', () => {
    const tokens = [
      'thisisaverylongtokennekotgnolyrevasisihtthisisaverylongtokennekotgnolyrevasisiht'
    ] // A single token longer than a row
    const grids = buildGrid(tokens, 0.5)

    // Ensure the token is split across multiple rows
    const gridRows = grids[0].join('\n')
    const gridString = grids[0].join('') // this might or might not contain the unbroken token, depending on the spacing
    // the slice lengths are not guaranteed since there is random spacing in the grid, but we can check for the first part of the token.
    expect(gridString).toContain(tokens[0])
    expect(gridRows).not.toContain(tokens[0])
  })

  test('should add random spaces between tokens', () => {
    const tokens = ['a', 'b', 'c']
    const grids = buildGrid(tokens, 0.5)

    // tokens should not be adjacent
    const gridString = grids[0].join('\n')
    const tokenPositions = tokens.map(token => gridString.indexOf(token))
    expect(tokenPositions[1]).toBeGreaterThan(tokenPositions[0] + 1)
    expect(tokenPositions[2]).toBeGreaterThan(tokenPositions[1] + 1)
  })

  // TODO: review the code, not even sure it is correct
  test.skip('should respect the spaceRatio parameter', () => {
    const tokens = ['a', 'b', 'c']
    const grids = buildGrid(tokens, 0.8) // 80% spaces

    // Count spaces and non-space characters
    const gridString = grids[0].join('')
    const spaceCount = (gridString.match(/ /g) || []).length
    const nonSpaceCount = gridString.length - spaceCount

    // Ensure the ratio of spaces to non-spaces is approximately 80%
    expect(spaceCount / (spaceCount + nonSpaceCount)).toBeCloseTo(0.8, 1)
  })
})
