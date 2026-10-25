/*
This file converts four messy retailer formats into one common offer shape.
It also converts prices, ratings, stock labels, and delivery times.
*/

const config = require("./config");

/** Keep only the digits in a price string and return them as a number. */
function numberFromPrice(value) {
  if (typeof value === "number") return value;
  let digits = "";
  for (const character of value || "") {
    if (character >= "0" && character <= "9") digits += character;
  }
  return Number(digits || 0);
}

/** Find the largest number in a delivery message, or return zero if absent. */
function deliveryDays(value) {
  let numbers = [];
  let current = "";
  for (const character of value || "") {
    if (character >= "0" && character <= "9") {
      current += character;
    } else if (current) {
      numbers.push(Number(current));
      current = "";
    }
  }
  if (current) numbers.push(Number(current));
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
}

/** Copy optional product attributes into the shared specs shape. */
function cleanSpecs(specs) {
  const source = specs || {};
  return {
    storageGB: source.storageGB === undefined ? null : source.storageGB,
    ramGB: source.ramGB === undefined ? null : source.ramGB,
    color: source.color || "",
    condition: source.condition || "",
    format: source.format || ""
  };
}

/** Create one common offer object from retailer fields already converted. */
function makeOffer(retailer, raw, priceINR, rating, availability, days) {
  return {
    id: raw.id,
    retailer,
    title: raw.title,
    brand: raw.brand || "",
    category: raw.category,
    modelNumber: raw.modelNumber || "",
    isbn: raw.isbn || "",
    specs: cleanSpecs(raw.specs),
    priceINR,
    rating,
    availability,
    deliveryDays: days,
    url: raw.url
  };
}

/** Convert Amazon rupee strings, five-point ratings, and stock phrases. */
function normalizeAmazon(raw) {
  let availability = "in_stock";
  if (raw.availability === "Currently unavailable") availability = "out_of_stock";
  if (raw.availability === "Only 3 left" || raw.availability === "Only 2 left") availability = "limited";
  return makeOffer("Amazon", raw, numberFromPrice(raw.price), raw.rating, availability, deliveryDays(raw.delivery));
}

/** Convert Flipkart numbers, fraction ratings, and stock flags. */
function normalizeFlipkart(raw) {
  let availability = "out_of_stock";
  if (raw.in_stock) availability = raw.few_left ? "limited" : "in_stock";
  const rating = Number(String(raw.rating).split("/")[0]);
  return makeOffer("Flipkart", raw, raw.price, rating, availability, deliveryDays(raw.delivery));
}

/** Convert eBay dollar strings, percentage ratings, and availability words. */
function normalizeEbay(raw) {
  let availability = "out_of_stock";
  if (raw.availability === "available") availability = "in_stock";
  const priceINR = numberFromPrice(raw.price) * config.usdToInr;
  const rating = raw.rating / 20;
  return makeOffer("eBay", raw, priceINR, rating, availability, deliveryDays(raw.delivery));
}

/** Convert Meesho rupee numbers, ten-point ratings, and yes/no stock. */
function normalizeMeesho(raw) {
  const availability = raw.availability === "yes" ? "in_stock" : "out_of_stock";
  return makeOffer("Meesho", raw, raw.price, raw.rating / 2, availability, deliveryDays(raw.delivery));
}

/** Select the retailer's matching normalizer for one raw listing. */
function normalizeListing(retailer, raw) {
  if (retailer === "Amazon") return normalizeAmazon(raw);
  if (retailer === "Flipkart") return normalizeFlipkart(raw);
  if (retailer === "eBay") return normalizeEbay(raw);
  return normalizeMeesho(raw);
}

module.exports = { normalizeAmazon, normalizeFlipkart, normalizeEbay, normalizeMeesho, normalizeListing };
