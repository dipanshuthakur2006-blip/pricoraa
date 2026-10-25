/*
This connector reads the local Meesho-shaped mock JSON file.
It filters sample listings by all query words and an optional category.
*/

const fs = require("fs");
const path = require("path");

/** Read the local mock listings for one retailer. */
function readProducts() {
  const filePath = path.join(process.cwd(), "data", "mock", "meesho.json");
  const fileText = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileText).products;
}

/** Return listings whose title, brand, and model contain every search word. */
function getListings(query, category) {
  const products = readProducts();
  const words = (query || "").toLowerCase().split(" ").filter(Boolean);
  const results = [];
  for (const product of products) {
    const text = `${product.title} ${product.brand || ""} ${product.modelNumber || ""}`.toLowerCase();
    let matchesWords = true;
    for (const word of words) {
      if (!text.includes(word)) matchesWords = false;
    }
    if (category && product.category !== category.toLowerCase()) matchesWords = false;
    if (matchesWords) results.push(product);
  }
  return results;
}

module.exports = { getListings };
