import { expandQuery, synonymDictionary } from "../lib/search";

function testExpansion() {
  console.log("--- Testing Query Expansion ---");
  const tests = [
    "laptop",
    "laptop bag",
    "phne",
    "oats",
    "smartphone"
  ];

  tests.forEach(q => {
    console.log(`Input: "${q}"`);
    console.log(`Expanded:`, expandQuery(q));
    console.log("-------------------");
  });
}

// Mocking some product data for fuzzy search testing
const testProducts = [
  { name: "MacBook Pro Laptop", category: "Electronics", shortDescription: "Powerful laptop for professionals" },
  { name: "Leather Bag", category: "Accessories", shortDescription: "Premium carry case for laptops" },
  { name: "iPhone 15", category: "Electronics", shortDescription: "The latest smartphone from Apple" },
  { name: "Organic Oats", category: "Grocery", shortDescription: "Healthy breakfast cereal" }
];

async function testFuzzyMock() {
  // We'll use a dynamic import for fuse.js since it's installed in node_modules
  const { default: Fuse } = await import("fuse.js");
  
  console.log("\n--- Testing Fuzzy Search (Mock) ---");
  const fuseOptions = {
    keys: ["name", "shortDescription", "category"],
    includeScore: true,
    threshold: 0.4
  };
  const fuse = new Fuse(testProducts, fuseOptions);

  const queries = ["lapto", "phne", "breakfast"];
  
  queries.forEach(q => {
    console.log(`Search Query: "${q}"`);
    const results = fuse.search(q);
    results.forEach(r => {
      console.log(`- Match: ${r.item.name} (Score: ${r.score?.toFixed(4)})`);
    });
    console.log("-------------------");
  });
}

// To run this: ts-node verification.ts (if ts-node is available)
// Or compile to JS and run with node.
// Since I'm in an environment where I can run commands, I'll try to run a simplified node script.
testExpansion();
testFuzzyMock();
