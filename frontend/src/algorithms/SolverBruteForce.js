export function solveBruteForce(grid, words) {
  const found = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  // Brute force: check every position for every word in every direction
  for (let word of words) {
    let wordFound = false;
    
    for (let i = 0; i < rows && !wordFound; i++) {
      for (let j = 0; j < cols && !wordFound; j++) {
        for (let [dr, dc] of directions) {
          if (checkWord(grid, word, i, j, dr, dc)) {
            found.push(word);
            wordFound = true;
            break;
          }
        }
      }
    }
  }

  return found;
}

function checkWord(grid, word, startRow, startCol, dr, dc) {
  let r = startRow;
  let c = startCol;
  
  for (let i = 0; i < word.length; i++) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return false;
    if (grid[r][c] !== word[i]) return false;
    r += dr;
    c += dc;
  }
  
  return true;
}