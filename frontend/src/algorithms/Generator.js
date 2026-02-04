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

  // Sort words by length (longest first) for better placement
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  const unplacedWords = [];

  // Try to place each word with increased attempts
  sortedWords.forEach(word => {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 1000; // Increased attempts
    
    while (!placed && attempts < maxAttempts) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
      
      if (canPlaceWord(word, row, col, dr, dc)) {
        placeWord(word, row, col, dr, dc);
        placed = true;
      }
      attempts++;
    }
    
    // If word couldn't be placed, track it
    if (!placed) {
      unplacedWords.push(word);
      console.warn(`Could not place word: ${word}`);
    }
  });

  // If any words couldn't be placed, try one more time with empty grid sections
  if (unplacedWords.length > 0) {
    for (const word of unplacedWords) {
      let placed = false;
      
      // Try to find empty regions
      for (let row = 0; row < size && !placed; row++) {
        for (let col = 0; col < size && !placed; col++) {
          for (let [dr, dc] of directions) {
            if (canPlaceWord(word, row, col, dr, dc)) {
              placeWord(word, row, col, dr, dc);
              placed = true;
              break;
            }
          }
        }
      }
    }
  }

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

// Calculate recommended maximum words for a given grid size
export function getMaxWordsForGrid(size) {
  // Formula: ensure enough space for all words
  // Conservative estimate based on grid area
  if (size <= 6) return Math.max(3, Math.floor(size * 0.8));
  if (size <= 8) return Math.floor(size * 1.0);
  if (size <= 10) return Math.floor(size * 1.2);
  if (size <= 12) return Math.floor(size * 1.4);
  if (size <= 15) return Math.floor(size * 1.6);
  return Math.min(30, Math.floor(size * 1.8));
}