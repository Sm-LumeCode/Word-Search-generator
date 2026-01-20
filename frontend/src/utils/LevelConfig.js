export function getLevelConfig(level) {
  const levels = {
    1: {
      size: 6,
      words: ['CAT', 'DOG', 'BIRD', 'FISH'],
      description: 'Beginner Level - 6x6 grid with 4 words'
    },
    2: {
      size: 8,
      words: ['APPLE', 'ORANGE', 'GRAPE', 'MANGO', 'BERRY'],
      description: 'Easy Level - 8x8 grid with 5 words'
    },
    3: {
      size: 10,
      words: ['PYTHON', 'JAVA', 'REACT', 'NODE', 'SWIFT', 'KOTLIN'],
      description: 'Medium Level - 10x10 grid with 6 words'
    },
    4: {
      size: 12,
      words: ['DATABASE', 'NETWORK', 'SECURITY', 'CLOUD', 'SERVER', 'CLIENT', 'FIREWALL'],
      description: 'Hard Level - 12x12 grid with 7 words'
    },
    5: {
      size: 15,
      words: ['ALGORITHM', 'STRUCTURE', 'MEMORY', 'PROCESSOR', 'THREAD', 'COMPILE', 'DEBUG', 'DEPLOY'],
      description: 'Expert Level - 15x15 grid with 8 words'
    }
  };

  return levels[level] || levels[1];
}