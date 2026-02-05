/**
 * IMPROVED DSA-based Keyword Extraction Module
 * 
 * KEY IMPROVEMENT: Stratified Sampling Approach
 * Problem Solved: Previous version heavily biased toward beginning of document
 * Solution: Sample keywords from MULTIPLE SECTIONS of the document independently
 * 
 * New Features:
 * 1. Divides document into N sections (configurable, default 5)
 * 2. Extracts top keywords from EACH section independently
 * 3. Merges results with deduplication, keeping section diversity info
 * 4. Final ranking considers both frequency AND section distribution
 * 
 * DSA Concepts Used:
 * 1. HashMap for frequency counting - O(n)
 * 2. Array filtering and mapping - O(n)
 * 3. Merge algorithm - O(k log k) where k = unique keywords
 * 4. Stratified sampling - ensures balanced representation
 */

// Comprehensive stop-words list
const STOP_WORDS = new Set([
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
  'include', 'includes', 'included', 'use', 'uses', 'used', 'using',
  'efficient', 'efficiently', 'common', 'commonly',
  'technique', 'techniques', 'method', 'methods',
  'approach', 'approaches', 'based',
  'example', 'examples', 'type', 'types', 'form', 'forms',
  'provide', 'provides', 'enable', 'enables', 'allow', 'allows',
  'apply', 'applies', 'way', 'ways',
  'help', 'helps', 'support', 'supports', 'computational'
]);

const MIN_WORD_LENGTH = 4;
const MAX_TEXT_LENGTH = 100000;
const NUM_SECTIONS = 5; // Divide document into 5 equal sections

/**
 * Tokenize text into words
 */
function tokenize(text) {
  const normalized = text.toLowerCase().replace(/[^a-z\s]/g, ' ');
  return normalized.split(/\s+/).filter(word => word.length > 0);
}

/**
 * Filter out stop-words and short words
 */
function filterWords(words) {
  return words.filter(word =>
    !STOP_WORDS.has(word) && word.length >= MIN_WORD_LENGTH
  );
}

/**
 * NEW: Build frequency map for a SECTION of the document
 * Returns both frequency map and the section identifier
 */
function buildFrequencyMapForSection(words, sectionNumber, totalSections) {
  const frequencyMap = {};
  
  for (const word of words) {
    if (!frequencyMap[word]) {
      frequencyMap[word] = {
        count: 0,
        sections: new Set()
      };
    }
    frequencyMap[word].count++;
    frequencyMap[word].sections.add(sectionNumber);
  }

  return frequencyMap;
}

/**
 * NEW: Compute scores for section-based extraction
 * Formula: score = (frequency × log(word_length) × section_diversity_bonus × technical_term_boost) / total_words
 */
function computeScoresForSection(frequencyMap, totalWords, sectionNumber) {
  const scoredWords = [];

  // Technical terms that should get a boost in OS/File Management contexts
  const technicalTerms = new Set([
    'allocation', 'swapping', 'virtual', 'contiguous', 'indexed', 
    'sequential', 'directory', 'fragmentation', 'partition', 'sector',
    'cluster', 'cylinder', 'scheduling', 'latency', 'throughput',
    'redundancy', 'mirroring', 'striping', 'parity', 'semaphore',
    'deadlock', 'synchronization', 'mutex', 'thread', 'kernel'
  ]);

  for (const [word, data] of Object.entries(frequencyMap)) {
    const frequency = data.count;
    const lengthScore = Math.log(word.length + 1);
    
    // Boost score for important technical terms
    const technicalBoost = technicalTerms.has(word) ? 1.5 : 1.0;
    
    const baseScore = (frequency * lengthScore * technicalBoost) / totalWords;

    scoredWords.push({
      word: word.toUpperCase(),
      frequency,
      length: word.length,
      score: baseScore,
      sections: Array.from(data.sections),
      sectionNumber,
      scoreBreakdown: {
        frequency,
        lengthScore: lengthScore.toFixed(3),
        technicalBoost,
        totalWords,
        formula: `(${frequency} × ${lengthScore.toFixed(3)} × ${technicalBoost}) / ${totalWords}`
      }
    });
  }

  return scoredWords.sort((a, b) => b.score - a.score);
}

/**
 * NEW: STRATIFIED EXTRACTION
 * Divides document into sections and extracts keywords from each independently
 * This ensures concepts from the entire document are represented
 */
function extractKeywordsStratified(text, k = 15) {
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

  const processedText = text.slice(0, MAX_TEXT_LENGTH);
  const wasTruncated = text.length > MAX_TEXT_LENGTH;
  const processingSteps = [];

  // STEP 1: Tokenize entire document
  const allTokens = tokenize(processedText);
  processingSteps.push({
    step: 1,
    name: 'Document Tokenization',
    description: `Convert entire document to tokens${wasTruncated ? ` (first ${MAX_TEXT_LENGTH.toLocaleString()} chars)` : ''}`,
    result: `${allTokens.length} total words extracted`,
    data: [`Total sections: ${NUM_SECTIONS}`, `Approx ${Math.floor(allTokens.length / NUM_SECTIONS)} words per section`]
  });

  // STEP 2: Divide into sections
  const sectionSize = Math.floor(allTokens.length / NUM_SECTIONS);
  const sections = [];
  
  for (let i = 0; i < NUM_SECTIONS; i++) {
    const start = i * sectionSize;
    const end = (i === NUM_SECTIONS - 1) ? allTokens.length : (i + 1) * sectionSize;
    sections.push({
      sectionNumber: i + 1,
      tokens: allTokens.slice(start, end),
      startPos: start,
      endPos: end
    });
  }

  processingSteps.push({
    step: 2,
    name: 'Stratified Document Division',
    description: `Divide document into ${NUM_SECTIONS} equal sections to ensure balanced keyword extraction`,
    result: `Created ${sections.length} sections`,
    data: sections.map(s => `Section ${s.sectionNumber}: ${s.tokens.length} words`)
  });

  // STEP 3: Extract keywords from EACH section independently
  const sectionKeywords = [];
  const wordsPerSection = Math.ceil(k / NUM_SECTIONS) + 2; // Extract a few more per section
  
  for (const section of sections) {
    const filteredWords = filterWords(section.tokens);
    if (filteredWords.length === 0) continue;

    const frequencyMap = buildFrequencyMapForSection(filteredWords, section.sectionNumber, NUM_SECTIONS);
    const scored = computeScoresForSection(frequencyMap, filteredWords.length, section.sectionNumber);
    
    // Take top N keywords from this section
    const topFromSection = scored.slice(0, wordsPerSection);
    sectionKeywords.push(...topFromSection);
  }

  processingSteps.push({
    step: 3,
    name: 'Per-Section Keyword Extraction',
    description: `Extract top ${wordsPerSection} keywords from each section independently using frequency × length scoring`,
    result: `Extracted ${sectionKeywords.length} total keywords across all sections`,
    data: sectionKeywords.slice(0, 10).map(kw => 
      `${kw.word} (Section ${kw.sectionNumber}, freq: ${kw.frequency})`
    )
  });

  // STEP 4: Merge and deduplicate across sections
  const mergedMap = {};
  
  for (const keyword of sectionKeywords) {
    const word = keyword.word;
    
    if (!mergedMap[word]) {
      mergedMap[word] = {
        word,
        frequency: 0,
        sections: new Set(),
        scores: [],
        length: keyword.length
      };
    }
    
    mergedMap[word].frequency += keyword.frequency;
    mergedMap[word].sections.add(keyword.sectionNumber);
    mergedMap[word].scores.push(keyword.score);
  }

  processingSteps.push({
    step: 4,
    name: 'Cross-Section Merging & Deduplication',
    description: 'Merge keywords that appear in multiple sections, tracking section diversity',
    result: `${Object.keys(mergedMap).length} unique keywords after deduplication`,
    data: []
  });

  // STEP 5: Final scoring with section diversity bonus
  const finalKeywords = [];
  
  for (const [word, data] of Object.entries(mergedMap)) {
    const sectionCount = data.sections.size;
    const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    
    // BONUS: Words appearing in multiple sections get priority
    const sectionDiversityBonus = 1 + (sectionCount - 1) * 0.3; // 30% bonus per additional section
    const finalScore = avgScore * sectionDiversityBonus;
    
    finalKeywords.push({
      word,
      frequency: data.frequency,
      length: data.length,
      score: finalScore,
      sectionCount,
      sections: Array.from(data.sections).sort(),
      positionDiversity: (sectionCount / NUM_SECTIONS), // 0 to 1
      scoreBreakdown: {
        frequency: data.frequency,
        sectionCount,
        sectionsPresent: Array.from(data.sections).join(', '),
        diversityBonus: sectionDiversityBonus.toFixed(2),
        finalScore: finalScore.toFixed(4)
      }
    });
  }

  // Sort by final score
  finalKeywords.sort((a, b) => b.score - a.score);

  processingSteps.push({
    step: 5,
    name: 'Final Ranking with Section Diversity Bonus',
    description: 'Rank keywords by score with 30% bonus for each additional section where word appears',
    result: `Top ${Math.min(k, finalKeywords.length)} keywords selected`,
    data: finalKeywords.slice(0, 5).map(kw =>
      `${kw.word}: ${kw.score.toFixed(4)} (appears in sections: ${kw.sections.join(', ')})`
    )
  });

  // STEP 6: Select top K with guaranteed section diversity
  const topK = ensureMinimumSectionRepresentation(finalKeywords, k, NUM_SECTIONS);

  processingSteps.push({
    step: 6,
    name: 'Balanced Selection',
    description: `Ensure at least one keyword from each section in final ${k} keywords`,
    result: `Selected ${topK.length} keywords with balanced section representation`,
    data: topK.map(kw => 
      `${kw.word} (sections: ${kw.sections.join(',')})`
    )
  });

  return {
    success: true,
    keywords: topK,
    allSortedKeywords: finalKeywords,
    processingSteps,
    stats: {
      totalWords: allTokens.length,
      validWords: filterWords(allTokens).length,
      totalKeywords: finalKeywords.length,
      uniqueWords: finalKeywords.length,
      selectedWords: topK.length,
      sections: NUM_SECTIONS,
      documentCoverage: wasTruncated ? 
        `${((MAX_TEXT_LENGTH / text.length) * 100).toFixed(1)}% (${MAX_TEXT_LENGTH.toLocaleString()} / ${text.length.toLocaleString()} chars)` : 
        '100%',
      sectionDistribution: getSectionDistribution(topK, NUM_SECTIONS)
    }
  };
}

/**
 * Ensure minimum representation from each section
 * This guarantees that even if Section 5 keywords score lower,
 * at least SOME keywords from Section 5 make it into the final list
 */
function ensureMinimumSectionRepresentation(keywords, k, numSections) {
  const result = [];
  const sectionCounts = new Array(numSections).fill(0);
  const minPerSection = 1; // At least 1 keyword per section
  
  // Phase 1: Ensure minimum representation from each section
  for (let sectionNum = 1; sectionNum <= numSections; sectionNum++) {
    const fromThisSection = keywords.find(kw => 
      kw.sections.includes(sectionNum) && !result.includes(kw)
    );
    
    if (fromThisSection) {
      result.push(fromThisSection);
      fromThisSection.sections.forEach(s => sectionCounts[s - 1]++);
    }
  }
  
  // Phase 2: Fill remaining slots with highest-scoring keywords
  for (const keyword of keywords) {
    if (result.length >= k) break;
    if (!result.includes(keyword)) {
      result.push(keyword);
      keyword.sections.forEach(s => sectionCounts[s - 1]++);
    }
  }
  
  return result.slice(0, k);
}

/**
 * Get distribution of keywords across sections for stats
 */
function getSectionDistribution(keywords, numSections) {
  const distribution = {};
  for (let i = 1; i <= numSections; i++) {
    const count = keywords.filter(kw => kw.sections.includes(i)).length;
    distribution[`Section ${i}`] = count;
  }
  return distribution;
}

/**
 * Helper function to get just the word list
 */
export function getKeywordList(extractionResult) {
  if (!extractionResult.success) {
    return [];
  }
  return extractionResult.keywords.map(k => k.word);
}

/**
 * Fisher-Yates shuffle algorithm for randomization
 * Used when user clicks refresh to get variety in keyword suggestions
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Main export - uses stratified extraction
 * Options:
 *   - shuffle: boolean - if true, randomizes the keyword selection from a larger pool
 */
export function extractKeywords(text, k = 15, options = {}) {
  const result = extractKeywordsStratified(text, k);
  
  // If shuffle option is enabled, randomize the selection from an expanded pool
  if (options.shuffle && result.success && result.allSortedKeywords) {
    // Use a MUCH larger pool for true variety - up to 10x or all available
    const poolSize = Math.min(k * 10, result.allSortedKeywords.length);
    const expandedPool = result.allSortedKeywords.slice(0, poolSize);
    
    // Shuffle multiple times for better randomization
    let shuffled = shuffleArray(expandedPool);
    shuffled = shuffleArray(shuffled); // Shuffle again for more randomness
    
    // Select top k from shuffled pool while maintaining section diversity
    const refreshedKeywords = ensureMinimumSectionRepresentation(shuffled, k, NUM_SECTIONS);
    
    return {
      ...result,
      keywords: refreshedKeywords,
      refreshed: true
    };
  }
  
  return result;
}