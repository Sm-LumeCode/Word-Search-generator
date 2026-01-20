const wordBank = {
  short: ['CAT', 'DOG', 'BAT', 'RAT', 'HAT', 'MAT', 'SUN', 'RUN', 'FUN', 'BUN'],
  medium: ['APPLE', 'GRAPE', 'MANGO', 'BERRY', 'PEACH', 'LEMON', 'MELON', 'CHERRY'],
  long: ['ORANGE', 'BANANA', 'PINEAPPLE', 'STRAWBERRY', 'BLUEBERRY', 'RASPBERRY'],
  tech: ['CODE', 'DATA', 'CLOUD', 'JAVA', 'PYTHON', 'REACT', 'NODE', 'SWIFT', 'RUBY', 'LINUX'],
  animals: ['LION', 'TIGER', 'BEAR', 'WOLF', 'EAGLE', 'SHARK', 'WHALE', 'DOLPHIN'],
  colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE', 'BLACK', 'WHITE'],
  nature: ['TREE', 'FLOWER', 'RIVER', 'OCEAN', 'MOUNTAIN', 'FOREST', 'DESERT', 'ISLAND'],
};

export function getRandomWords(maxLength, count) {
  const allWords = Object.values(wordBank).flat();
  const validWords = allWords.filter(word => word.length <= maxLength);
  
  // Shuffle and select
  const shuffled = validWords.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}