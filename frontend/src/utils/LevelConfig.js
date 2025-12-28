export function getLevelConfig(level) {
  const configs = {
    1: {
      size: 5,
      words: ['CAT', 'DOG', 'BAT'],
      description: 'Level 1: Easy - Small grid with 3 simple words'
    },
    2: {
      size: 7,
      words: ['TREE', 'BIRD', 'FISH', 'FROG'],
      description: 'Level 2: Medium - Bigger grid with 4 words'
    },
    3: {
      size: 9,
      words: ['HOUSE', 'MOUSE', 'PHONE', 'TABLE', 'CHAIR'],
      description: 'Level 3: Hard - Large grid with 5 medium words'
    },
    4: {
      size: 12,
      words: ['ALGORITHM', 'DATA', 'FUNCTION', 'VARIABLE', 'COMPUTER', 'SEARCH'],
      description: 'Level 4: Very Hard - Complex words in large grid'
    },
    5: {
      size: 15,
      words: ['STRUCTURE', 'ALGORITHM', 'KEYBOARD', 'DATABASE', 'MONITOR', 'FUNCTION', 'VARIABLE', 'COMPUTER'],
      description: 'Level 5: Expert - Maximum difficulty with 8 complex words'
    }
  };

  return configs[level] || configs[1];
}