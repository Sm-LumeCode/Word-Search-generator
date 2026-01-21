# 🔍 Word Search Master

A progressive word search puzzle game built with React and Vite that demonstrates the power of Data Structures and Algorithms (DSA) through interactive gameplay.

## 🌟 Features

### **Two Game Modes**

#### 📝 Content Mode
- **Custom Grid Size**: Create puzzles from 3x3 to 20x20
- **Custom or Auto-Generated Words**: Choose your own words or let the system generate them
- **Fast Puzzle Generation**: Uses advanced algorithms to place words in all 8 directions
- **Instant Solver**: DFS + Trie data structure solves puzzles in milliseconds
- **Dynamic Difficulty**: Auto-adjusts word complexity based on grid size

#### 🚀 Demo Mode (Manual vs DSA)
- **Split-Screen Comparison**: See human vs algorithm performance side-by-side
- **Manual Puzzle Solving**: Click and drag to find words yourself
- **Automatic Solver**: Watch the DSA algorithm solve the same puzzle instantly
- **Real-Time Timers**: Compare your speed against the algorithm
- **5 Progressive Levels**: From easy 5x5 grids to expert 15x15 grids
- **Performance Metrics**: See exactly how much faster DSA is!

## 🎮 How to Play

### Content Mode
1. Choose your grid size (3-20)
2. Select word source:
   - **Custom**: Enter your own comma-separated words
   - **Auto-Generate**: System creates random words
3. Generate puzzles and solve them instantly!

### Demo Mode
1. **Manual Side (Left)**:
   - Click and drag from first letter to last letter
   - Works in all 8 directions (horizontal, vertical, diagonal)
   - Timer starts on first click
   - Find all words to complete the level

2. **Automatic Side (Right)**:
   - Click "Start Auto Solve" button
   - Watch the algorithm find words with visualization
   - Compare your time with DSA's time

3. **Progression**:
   - Complete both sides to unlock next level
   - 5 levels total: Easy → Expert
   - Track speed improvement across levels

## 🛠️ Tech Stack

- **Frontend**: React 18.2
- **Build Tool**: Vite 4.3
- **Styling**: Pure CSS with gradients and animations
- **Algorithms**:
  - **Trie Data Structure**: Efficient word storage and lookup
  - **Depth-First Search (DFS)**: Fast word finding algorithm
  - **Custom Puzzle Generator**: Places words in all 8 directions

## 📁 Project Structure
```
word-search-game/
├── public/
│   └── index.html
├── src/
│   ├── algorithms/
│   │   ├── Generator.js          # Puzzle generation algorithm
│   │   ├── SolverDFS.js          # DFS solver with Trie
│   │   └── Trie.js               # Trie data structure
│   ├── components/
│   │   ├── Grid.jsx              # Puzzle grid component
│   │   └── WordList.jsx          # Word list display
│   ├── pages/
│   │   ├── LandingPage.jsx       # Welcome screen
│   │   ├── CategoryPage.jsx      # Mode selection
│   │   ├── ContentMode.jsx       # Content mode game
│   │   └── DemoMode.jsx          # Demo mode (manual vs DSA)
│   ├── utils/
│   │   ├── WordLists.js          # Predefined word collections
│   │   └── LevelConfig.js        # Level configurations
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── styles.css                # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/word-search-game.git
   cd word-search-game
```

2. **Install dependencies**
```bash
   npm install
```

3. **Start development server**
```bash
   npm run dev
```

4. **Open in browser**
```
   http://localhost:5173
```

### Build for Production
```bash
npm run build
```

The optimized build will be in the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

## 🎯 Game Controls

### Manual Selection (Demo Mode)
- **Click and Hold**: Start word selection
- **Drag**: Extend selection in any direction
- **Release**: Complete selection and check word
- **Valid Directions**: 
  - Horizontal (→ ←)
  - Vertical (↑ ↓)
  - Diagonal (↗ ↘ ↙ ↖)

### Buttons
- **Generate New Puzzle**: Creates a new puzzle with same settings
- **Solve Puzzle**: Instantly solves and highlights all words
- **New Setup**: Return to configuration screen
- **Start Auto Solve**: Begin automatic solving in demo mode
- **Next Level**: Progress to next difficulty level
- **Retry Level**: Restart current level

## 🧩 Algorithm Explanation

### Puzzle Generation
```javascript
// Places words in 8 directions with collision detection
directions = [
  [0, 1],   // horizontal right
  [1, 0],   // vertical down
  [1, 1],   // diagonal down-right
  [-1, 1],  // diagonal up-right
  [0, -1],  // horizontal left
  [-1, 0],  // vertical up
  [-1, -1], // diagonal up-left
  [1, -1]   // diagonal down-left
]
```

### DFS Solver with Trie
```
1. Build Trie from word list - O(W × L)
2. For each cell in grid:
   - Start DFS traversal
   - Check if path exists in Trie
   - Mark found words
3. Time Complexity: O(N × M × 8^L)
   where N×M is grid size, L is max word length
```

### Why DSA is Faster?
- **Trie**: O(L) word lookup vs O(W × L) linear search
- **DFS**: Explores all paths systematically
- **Backtracking**: Prunes invalid paths early
- **Human**: Random search, visual scanning limitations

##  Performance Metrics

Typical results from Demo Mode:

| Level | Grid Size | Words | Manual Time | DSA Time | Speed Gain |
|-------|-----------|-------|-------------|----------|------------|
| 1     | 5×5       | 3     | ~15-30s     | ~0.2s    | 150×       |
| 2     | 7×7       | 4     | ~30-60s     | ~0.3s    | 200×       |
| 3     | 9×9       | 5     | ~60-120s    | ~0.5s    | 240×       |
| 4     | 12×12     | 6     | ~120-180s   | ~0.8s    | 225×       |
| 5     | 15×15     | 8     | ~180-300s   | ~1.2s    | 250×       |

##  Features Highlight

### Visual Design
-  Gradient backgrounds and smooth animations
-  Color-coded states (selecting, found, highlighted)
-  Fully responsive design
-  Smooth hover effects and transitions

### User Experience
-  Drag-to-select for easy word selection
-  Real-time timers with millisecond precision
-  Performance comparison statistics
-  Progressive difficulty system
-  Instant puzzle regeneration

### Code Quality
-  Modular component architecture
-  Reusable algorithm modules
-  Clean separation of concerns
-  Well-documented code
-  Optimized performance

##  Configuration

### Adding New Words

Edit `src/utils/WordLists.js`:
```javascript
const wordLists = {
  easy: ['CAT', 'DOG', 'RAT', ...],
  medium: ['HOUSE', 'MOUSE', ...],
  hard: ['ALGORITHM', 'STRUCTURE', ...],
  custom: ['YOUR', 'WORDS', 'HERE']
};
```

### Adding New Levels

Edit `src/utils/LevelConfig.js`:
```javascript
6: {
  size: 20,
  words: ['WORD1', 'WORD2', ...],
  description: 'Level 6: Your custom level'
}
```

### Customizing Grid Size Limits

In `src/pages/ContentMode.jsx`, change:
```javascript
min="3"  // Minimum grid size
max="20" // Maximum grid size
```

## 👨‍💻 Author
Surabhi M 
Spandana M
T R Karthikeya
