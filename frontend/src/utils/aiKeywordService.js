// src/utils/aiKeywordService.js
// Mock AI service to avoid CORS issues in frontend

export async function getAIText(text) {
  // Simulate AI behavior by returning trimmed text
  // In demo/viva: explain AI is abstracted due to browser CORS
  return text.slice(0, 3000);
}
