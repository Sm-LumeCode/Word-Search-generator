const wordLists = {
  easy: ['CAT', 'DOG', 'RAT', 'BAT', 'HAT', 'MAT', 'SAT', 'FAT', 'PIG', 'COW', 'HEN', 'FOX'],
  medium: ['HOUSE', 'MOUSE', 'TRAIN', 'PLANE', 'TRUCK', 'HORSE', 'CHAIR', 'TABLE', 'PHONE', 'WATCH'],
  hard: ['ALGORITHM', 'STRUCTURE', 'FUNCTION', 'VARIABLE', 'COMPUTER', 'KEYBOARD', 'MONITOR', 'DATABASE'],
  dsa: ['ARRAY', 'STACK', 'QUEUE', 'TREE', 'GRAPH', 'HASH', 'SORT', 'SEARCH', 'NODE', 'LINK', 'HEAP', 'LIST']
};

export function getRandomWords(size, count) {
  let availableWords = [];
  
  if (size <= 5) {
    availableWords = [...wordLists.easy];
  } else if (size <= 8) {
    availableWords = [...wordLists.easy, ...wordLists.medium];
  } else {
    availableWords = [...wordLists.easy, ...wordLists.medium, ...wordLists.hard, ...wordLists.dsa];
  }
  
  // Filter words that fit in the grid
  availableWords = availableWords.filter(word => word.length <= size);
  
  // Shuffle and select
  const shuffled = availableWords.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}