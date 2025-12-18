import { Trie } from "./Trie";

export function solveGrid(grid, words) {
  const trie = new Trie(words);
  const found = new Set();
  const rows = grid.length;
  const cols = grid[0].length;

  const dfs = (r, c, node, visited) => {
    if (
      r < 0 || c < 0 || r >= rows || c >= cols ||
      visited.has(`${r},${c}`) ||
      !node.children[grid[r][c]]
    ) return;

    node = node.children[grid[r][c]];
    if (node.word) found.add(node.word);

    visited.add(`${r},${c}`);
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr || dc) dfs(r + dr, c + dc, node, visited);
      }
    }
    visited.delete(`${r},${c}`);
  };

  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      dfs(i, j, trie.root, new Set());

  return [...found];
}
