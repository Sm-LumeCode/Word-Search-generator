export function getGameLevelConfig(level) {
  const levels = {
    // 6x6 grids - Easy (30-40 seconds)
    1: {
      size: 6,
      words: ['CAT', 'DOG'],
      timeLimit: 30000,
      description: 'Level 1 - Animals - 6x6 grid'
    },
    2: {
      size: 6,
      words: ['SUN', 'MOON'],
      timeLimit: 30000,
      description: 'Level 2 - Space - 6x6 grid'
    },
    3: {
      size: 6,
      words: ['RED', 'BLUE'],
      timeLimit: 35000,
      description: 'Level 3 - Colors - 6x6 grid'
    },
    4: {
      size: 6,
      words: ['TREE', 'LEAF'],
      timeLimit: 40000,
      description: 'Level 4 - Nature - 6x6 grid'
    },
    
    // 8x8 grids - Medium (50-70 seconds)
    5: {
      size: 8,
      words: ['LION', 'BEAR', 'WOLF'],
      timeLimit: 50000,
      description: 'Level 5 - Wild Animals - 8x8 grid'
    },
    6: {
      size: 8,
      words: ['APPLE', 'GRAPE', 'MANGO'],
      timeLimit: 55000,
      description: 'Level 6 - Fruits - 8x8 grid'
    },
    7: {
      size: 8,
      words: ['OCEAN', 'RIVER', 'LAKE'],
      timeLimit: 60000,
      description: 'Level 7 - Water Bodies - 8x8 grid'
    },
    8: {
      size: 8,
      words: ['STORM', 'CLOUD', 'RAIN'],
      timeLimit: 65000,
      description: 'Level 8 - Weather - 8x8 grid'
    },
    
    // 10x10 grids - Hard (80-100 seconds)
    9: {
      size: 10,
      words: ['PYTHON', 'JAVA', 'RUBY', 'SWIFT'],
      timeLimit: 80000,
      description: 'Level 9 - Programming - 10x10 grid'
    },
    10: {
      size: 10,
      words: ['GUITAR', 'PIANO', 'DRUMS', 'FLUTE'],
      timeLimit: 85000,
      description: 'Level 10 - Music - 10x10 grid'
    },
    11: {
      size: 10,
      words: ['SOCCER', 'TENNIS', 'HOCKEY', 'RUGBY'],
      timeLimit: 90000,
      description: 'Level 11 - Sports - 10x10 grid'
    },
    12: {
      size: 10,
      words: ['BURGER', 'PIZZA', 'PASTA', 'SALAD'],
      timeLimit: 95000,
      description: 'Level 12 - Food - 10x10 grid'
    },
    
    // 12x12 grids - Expert (110-130 seconds)
    13: {
      size: 12,
      words: ['MOUNTAIN', 'DESERT', 'FOREST', 'ISLAND', 'VALLEY'],
      timeLimit: 110000,
      description: 'Level 13 - Geography - 12x12 grid'
    },
    14: {
      size: 12,
      words: ['DIAMOND', 'EMERALD', 'RUBY', 'PEARL', 'GOLD'],
      timeLimit: 115000,
      description: 'Level 14 - Gems - 12x12 grid'
    },
    15: {
      size: 12,
      words: ['GALAXY', 'PLANET', 'COMET', 'STAR', 'MOON'],
      timeLimit: 120000,
      description: 'Level 15 - Astronomy - 12x12 grid'
    },
    16: {
      size: 12,
      words: ['DRAGON', 'PHOENIX', 'UNICORN', 'GRIFFIN', 'SPHINX'],
      timeLimit: 125000,
      description: 'Level 16 - Mythology - 12x12 grid'
    },
    
    // 15x15 grids - Master (140-160 seconds)
    17: {
      size: 15,
      words: ['COMPUTER', 'KEYBOARD', 'MONITOR', 'MOUSE', 'PRINTER', 'SPEAKER'],
      timeLimit: 140000,
      description: 'Level 17 - Technology - 15x15 grid'
    },
    18: {
      size: 15,
      words: ['ELEPHANT', 'GIRAFFE', 'ZEBRA', 'RHINO', 'HIPPO', 'LEOPARD'],
      timeLimit: 145000,
      description: 'Level 18 - Safari - 15x15 grid'
    },
    19: {
      size: 15,
      words: ['CHOCOLATE', 'VANILLA', 'STRAWBERRY', 'CARAMEL', 'MINT', 'COFFEE'],
      timeLimit: 150000,
      description: 'Level 19 - Flavors - 15x15 grid'
    },
    20: {
      size: 15,
      words: ['ADVENTURE', 'MYSTERY', 'ROMANCE', 'THRILLER', 'FANTASY', 'HORROR', 'COMEDY'],
      timeLimit: 160000,
      description: 'Level 20 - Movie Genres - 15x15 grid (Final Level!)'
    }
  };

  return levels[level] || levels[1];
}