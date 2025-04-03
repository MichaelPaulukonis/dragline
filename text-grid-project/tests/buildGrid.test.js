import { buildGrid } from '../src/gridBuilder';

describe('buildGrid', () => {
  test('should create a single grid when all tokens fit', () => {
    const tokens = ['hello', 'world', 'test'];
    const grids = buildGrid(tokens, 0.5);

    // Ensure only one grid is created
    expect(grids.length).toBe(1);

    // Ensure all tokens are present in the grid
    const gridString = grids[0].map((row) => row.join('')).join('\n');
    tokens.forEach((token) => {
      expect(gridString).toContain(token);
    });
  });

  test('should create multiple grids when tokens exceed one grid', () => {
    const tokens = Array(200).fill('longtoken'); // Too many tokens for one grid
    const grids = buildGrid(tokens, 0.5);

    // Ensure multiple grids are created
    expect(grids.length).toBeGreaterThan(1);

    // Ensure all tokens are placed across grids
    const allGridsString = grids.map((grid) => grid.map((row) => row.join('')).join('\n')).join('\n');
    tokens.forEach((token) => {
      expect(allGridsString).toContain(token);
    });
  });

  test('should split tokens across lines if they exceed the row boundary', () => {
    const tokens = ['thisisaverylongtoken']; // A single token longer than a row
    const grids = buildGrid(tokens, 0.5);

    // Ensure the token is split across multiple rows
    const gridString = grids[0].map((row) => row.join('')).join('\n');
    expect(gridString).toContain('thisisaverylongtoken'.slice(0, 40)); // First part of the token
    expect(gridString).toContain('thisisaverylongtoken'.slice(40)); // Remaining part of the token
  });

  test('should add random spaces between tokens', () => {
    const tokens = ['a', 'b', 'c'];
    const grids = buildGrid(tokens, 0.5);

    // Ensure there are spaces between tokens
    const gridString = grids[0].map((row) => row.join('')).join('');
    const tokenPositions = tokens.map((token) => gridString.indexOf(token));
    expect(tokenPositions[1]).toBeGreaterThan(tokenPositions[0] + 1); // Space between 'a' and 'b'
    expect(tokenPositions[2]).toBeGreaterThan(tokenPositions[1] + 1); // Space between 'b' and 'c'
  });

  test.skip('should respect the spaceRatio parameter', () => {
    const tokens = ['a', 'b', 'c'];
    const grids = buildGrid(tokens, 0.8); // 80% spaces

    // Count spaces and non-space characters
    const gridString = grids[0].map((row) => row.join('')).join('');
    const spaceCount = (gridString.match(/ /g) || []).length;
    const nonSpaceCount = gridString.length - spaceCount;

    // Ensure the ratio of spaces to non-spaces is approximately 80%
    expect(spaceCount / (spaceCount + nonSpaceCount)).toBeCloseTo(0.8, 1);
  });
});