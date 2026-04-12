/**
 * Synonym Dictionary for Search Query Expansion
 */
export const synonymDictionary: Record<string, string[]> = {
  laptop: ["notebook", "computer", "ultrabook"],
  bag: ["carry case", "backpack", "pouch"],
  phone: ["smartphone", "mobile", "cellphone"],
  oats: ["cereal", "porridge", "breakfast"],
  shoes: ["footwear", "sneakers", "boots"],
  watch: ["timepiece", "smartwatch", "wearable"],
  phne: ["phone"], // Common typo handled by synonym or fuzzy? User specifically asked for this.
};

/**
 * Normalizes and expands a search query using the synonym dictionary.
 * 
 * @param query - The raw user input query.
 * @returns An array of strings including the original and expanded terms.
 */
export function expandQuery(query: string): string[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  const words = normalized.split(/\s+/);
  const results: string[] = [normalized];

  // For each word in the query, check for synonyms
  words.forEach(word => {
    if (synonymDictionary[word]) {
      synonymDictionary[word].forEach(synonym => {
        // Create a new version of the query with the synonym
        // If query is multiple words, replace the specific word with its synonym
        if (words.length > 1) {
          const expanded = words.map(w => w === word ? synonym : w).join(" ");
          if (!results.includes(expanded)) {
            results.push(expanded);
          }
        } else {
          // Single word query, just add the synonym
          if (!results.includes(synonym)) {
            results.push(synonym);
          }
        }
      });
    }
  });

  return results;
}
