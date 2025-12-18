export function generateGrid(size, words) {
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    )
  );

  words.forEach((word, idx) => {
    for (let i = 0; i < word.length && i < size; i++) {
      grid[idx][i] = word[i];
    }
  });

  return grid;
}
