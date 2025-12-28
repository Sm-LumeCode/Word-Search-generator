export function generateHardPuzzle(size, words) {
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => '')
  );

  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [-1, 1],  // diagonal up-right
    [0, -1],  // horizontal backward
    [-1, 0],  // vertical upward
    [-1, -1], // diagonal up-left
    [1, -1]   // diagonal down-left
  ];

  const canPlaceWord = (word, row, col, dr, dc) => {
    for (let i = 0; i < word.length; i++) {
      const r = row + i * dr;
      const c = col + i * dc;
      if (r < 0 || r >= size || c < 0 || c >= size) return false;
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
    }
    return true;
  };

  const placeWord = (word, row, col, dr, dc) => {
    for (let i = 0; i < word.length; i++) {
      const r = row + i * dr;
      const c = col + i * dc;
      grid[r][c] = word[i];
    }
  };

  // Try to place each word
  words.forEach(word => {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 200) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
      
      if (canPlaceWord(word, row, col, dr, dc)) {
        placeWord(word, row, col, dr, dc);
        placed = true;
      }
      attempts++;
    }
  });

  // Fill empty cells with random letters
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return grid;
}