/**
 * DSA-based Keyword Extraction Module
 * 
 * This module demonstrates the following DSA concepts:
 * 1. HashMap (JavaScript Object) for frequency counting - O(n) insertion and lookup
 * 2. Array filtering and mapping - O(n) operations
 * 3. Sorting algorithm - O(n log n) using JavaScript's built-in sort
 * 4. Logarithmic scoring function for word importance
 * 
 * Time Complexity Analysis:
 * - Tokenization: O(n) where n is the number of characters
 * - Stop-word filtering: O(w) where w is the number of words
 * - Frequency counting: O(w) using HashMap
 * - Scoring: O(w)
 * - Sorting: O(w log w)
 * - Overall: O(n + w log w)
 */

// Comprehensive stop-words list (common English words to filter out)
const STOP_WORDS = new Set([
  // Basic stop words
  'is', 'and', 'the', 'of', 'to', 'in', 'for', 'with', 'on', 'by',
  'a', 'an', 'as', 'at', 'be', 'but', 'or', 'if', 'it', 'from',
  'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may',
  'might', 'must', 'can', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'also', 'any', 'because', 'until', 'while',

  // Domain-specific common words
  'include', 'includes', 'included',
  'use', 'uses', 'used', 'using',
  'efficient', 'efficiently',
  'common', 'commonly',
  'technique', 'techniques',
  'method', 'methods',
  'approach', 'approaches',
  'based',
  'problem', 'problems',
  'solve', 'solves', 'solving', 'solution', 'solutions',
  'example', 'examples',
  'type', 'types',
  'form', 'forms',
  'provide', 'provides',
  'enable', 'enables',
  'allow', 'allows',
  'apply', 'applies',
  'process', 'processes',
  'way', 'ways',
  'help', 'helps',
  'support', 'supports',
  'system', 'systems',
  'operation', 'operations',
  'computational'
]);

const MIN_WORD_LENGTH = 4;

/**
 * Step 1: Tokenize text into words
 * Time Complexity: O(n) where n is the number of characters
 */
function tokenize(text) {
  // Split by common delimiters and clean
  const normalized = text.toLowerCase().replace(/[^a-z\s]/g, ' ');
  const tokens = normalized.split(/\s+/).filter(word => word.length > 0);
  
  return tokens;
}

/**
 * Step 2: Filter out stop-words and short words
 * Time Complexity: O(w) where w is the number of words
 */
function filterWords(words) {
  return words.filter(word =>
    !STOP_WORDS.has(word) && word.length >= MIN_WORD_LENGTH
  );
}

/**
 * Step 3: Build frequency map using HashMap
 * Time Complexity: O(w) where w is the number of words
 */
function buildFrequencyMap(words) {
  const frequencyMap = {};

  for (const word of words) {
    frequencyMap[word] = (frequencyMap[word] || 0) + 1;
  }

  return frequencyMap;
}

/**
 * Step 4: Compute scores for each word
 * Formula: score = (frequency × log(word_length)) / total_words
 * Time Complexity: O(u) where u is the number of unique words
 */
function computeScores(frequencyMap, totalWords) {
  const scoredWords = [];

  for (const [word, frequency] of Object.entries(frequencyMap)) {
    const lengthScore = Math.log(word.length + 1);
    const score = (frequency * lengthScore) / totalWords;

    scoredWords.push({
      word: word.toUpperCase(),
      frequency,
      length: word.length,
      score,
      scoreBreakdown: {
        frequency,
        lengthScore: lengthScore.toFixed(3),
        totalWords,
        formula: `(${frequency} × ${lengthScore.toFixed(3)}) / ${totalWords}`
      }
    });
  }

  return scoredWords;
}

/**
 * Step 5: Sort words by score in descending order
 * Time Complexity: O(u log u) where u is the number of unique words
 */
function sortByScore(scoredWords) {
  return scoredWords.sort((a, b) => b.score - a.score);
}

/**
 * Main keyword extraction function
 */
export function extractKeywords(text, k = 15) {
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: 'Please enter some text to extract keywords from.',
      keywords: [],
      processingSteps: []
    };
  }

  if (!k || k <= 0) {
    k = 15;
  }

  const processingSteps = [];

  // Step 1: Tokenization
  const tokens = tokenize(text);
  processingSteps.push({
    step: 1,
    name: 'Tokenization',
    description: 'Convert text to lowercase and split into individual words',
    result: `${tokens.length} words extracted`,
    data: tokens.slice(0, 20)
  });

  // Step 2: Filter stop-words and short words
  const filteredWords = filterWords(tokens);
  processingSteps.push({
    step: 2,
    name: 'Filtering',
    description: `Remove stop-words and words with length < ${MIN_WORD_LENGTH}`,
    result: `${filteredWords.length} valid words remaining`,
    data: filteredWords.slice(0, 20)
  });

  if (filteredWords.length === 0) {
    return {
      success: false,
      error: 'No valid keywords found after filtering. Try entering more specific content.',
      keywords: [],
      processingSteps
    };
  }

  // Step 3: Build frequency map
  const frequencyMap = buildFrequencyMap(filteredWords);
  const uniqueWords = Object.keys(frequencyMap).length;
  processingSteps.push({
    step: 3,
    name: 'Frequency Counting',
    description: 'Store words in HashMap and count occurrences',
    result: `${uniqueWords} unique keywords found`,
    data: Object.entries(frequencyMap).slice(0, 10).map(([word, freq]) => `${word}: ${freq}`)
  });

  // Step 4: Compute scores
  const scoredWords = computeScores(frequencyMap, filteredWords.length);
  processingSteps.push({
    step: 4,
    name: 'Score Computation',
    description: 'Calculate score = (frequency × log(word_length)) / total_words',
    result: `Scores computed for ${scoredWords.length} keywords`,
    data: scoredWords.slice(0, 5).map(w =>
      `${w.word}: ${w.score.toFixed(4)} = (${w.frequency} × ${w.scoreBreakdown.lengthScore}) / ${w.scoreBreakdown.totalWords}`
    )
  });

  // Step 5: Sort by score
  const sortedWords = sortByScore(scoredWords);
  processingSteps.push({
    step: 5,
    name: 'Sorting',
    description: 'Sort words by score in descending order',
    result: `Words sorted by importance`,
    data: sortedWords.slice(0, 10).map(w => `${w.word}: ${w.score.toFixed(4)}`)
  });

  // Step 6: Select top K words
  const topK = Math.min(k, sortedWords.length);
  const keywords = sortedWords.slice(0, topK);
  processingSteps.push({
    step: 6,
    name: 'Top-K Selection',
    description: `Select top ${topK} keywords`,
    result: `${topK} keywords extracted`,
    data: keywords.map(w => `${w.word} (freq: ${w.frequency}, score: ${w.score.toFixed(4)})`)
  });

  return {
    success: true,
    keywords,
    allSortedKeywords: sortedWords,
    processingSteps,
    stats: {
      totalWords: tokens.length,
      validWords: filteredWords.length,
      bigramsDetected: 0, // No bigrams anymore
      totalKeywords: filteredWords.length,
      uniqueWords,
      selectedWords: topK,
      filterRate: ((tokens.length - filteredWords.length) / tokens.length * 100).toFixed(1) + '%'
    }
  };
}

/**
 * Helper function to get just the word list for word search generation
 */
export function getKeywordList(extractionResult) {
  if (!extractionResult.success) {
    return [];
  }
  return extractionResult.keywords.map(k => k.word);
}