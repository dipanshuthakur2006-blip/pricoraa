/*
This file compares two titles using a small Jaccard word-overlap score.
Common filler words and punctuation are removed before the score is calculated.
*/
/** Return the Jaccard similarity of two cleaned product titles. */
function titleSimilarity(firstTitle, secondTitle) {
  const stopWords = ["the", "a", "an", "with", "and", "for", "new", "by", "in", "to", "of", "gb", "inch", "book", "laptop"];
  /* Clean one title and prepare its words for the comparison. */
  const cleanWords = function (title) {
    let cleaned = "";
    for (const character of (title || "").toLowerCase()) {
      if ((character >= "a" && character <= "z") || (character >= "0" && character <= "9")) cleaned += character;
      else cleaned += " ";
    }
    const words = cleaned.split(" ").filter(Boolean);
    return words.filter(function (word) {
      /* Leave common filler words out of the title match. */
      return !stopWords.includes(word);
    });
  };
  const firstWords = [...new Set(cleanWords(firstTitle))];
  const secondWords = [...new Set(cleanWords(secondTitle))];
  let shared = 0;
  for (const word of firstWords) if (secondWords.includes(word)) shared += 1;
  const total = firstWords.length + secondWords.length - shared;
  if (total === 0) return 0;
  return shared / total;
}
module.exports = { titleSimilarity };
