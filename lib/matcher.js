/*
This file classifies offer pairs and groups only exact product matches together.
It keeps likely variants and similar products visible as related suggestions.
*/

const config = require("./config");
const { titleSimilarity } = require("./similarity");

/** Return true when a title contains one of the listed accessory terms. */
function hasAccessoryWord(title) {
  const words = (title || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const accessoryWords = ["case", "cover", "charger", "protector", "bag", "sleeve"];
  for (const word of words) if (accessoryWords.includes(word)) return true;
  if ((title || "").toLowerCase().includes("screen guard")) return true;
  return false;
}

/** Return the names of product specifications that differ between offers. */
function differentSpecs(first, second) {
  const fields = ["storageGB", "ramGB", "color", "condition", "format"];
  const names = { storageGB: "storage", ramGB: "RAM", color: "color", condition: "condition", format: "format" };
  const differences = [];
  for (const field of fields) {
    let firstValue = first.specs ? first.specs[field] : null;
    let secondValue = second.specs ? second.specs[field] : null;
    if (firstValue === null || firstValue === undefined) firstValue = "";
    if (secondValue === null || secondValue === undefined) secondValue = "";
    if (String(firstValue).toLowerCase() !== String(secondValue).toLowerCase()) differences.push(names[field]);
  }
  return differences;
}

/** Make a readable reason for a structured variant. */
function variantReason(first, second, differences) {
  if (differences.length === 0) return "The listings share a product identifier but have different formats.";
  const details = [];
  for (const field of differences) {
    let key = field;
    if (field === "storage") key = "storageGB";
    if (field === "RAM") key = "ramGB";
    let firstValue = first.specs[key] || "not listed";
    let secondValue = second.specs[key] || "not listed";
    if (field === "storage" || field === "RAM") {
      if (first.specs[key]) firstValue += "GB";
      if (second.specs[key]) secondValue += "GB";
    }
    details.push(`${field} differs (${firstValue} vs ${secondValue})`);
  }
  return `Variant: ${details.join(", ")}.`;
}

/** Compare two offers using identifiers, brand, specifications, and title text. */
function compareOffers(first, second, options) {
  const settings = { useIdentifiers: true, useBrand: true, useSpecs: true, useTitle: true, ...(options || {}) };
  if (first.category !== second.category) return { matchClass: "different", confidence: 100, reason: "The listings belong to different product categories." };
  const firstAccessory = hasAccessoryWord(first.title);
  const secondAccessory = hasAccessoryWord(second.title);
  if (firstAccessory !== secondAccessory) return { matchClass: "different", confidence: 98, reason: "One listing is an accessory and the other is the main product." };
  let sameBrand = true;
  if (settings.useBrand && first.brand && second.brand) {
    sameBrand = first.brand.toLowerCase() === second.brand.toLowerCase();
  } else if (settings.useBrand) {
    sameBrand = false;
  }
  if (settings.useIdentifiers && first.isbn && second.isbn) {
    if (first.isbn !== second.isbn) return { matchClass: "different", confidence: 100, reason: "The book ISBN numbers are different." };
    const firstFormat = first.specs ? first.specs.format : "";
    const secondFormat = second.specs ? second.specs.format : "";
    if (!settings.useSpecs || firstFormat === secondFormat) return { matchClass: "exact", confidence: 100, reason: "The ISBN and book formats match." };
    return { matchClass: "variant", confidence: 95, reason: variantReason(first, second, ["format"]) };
  }
  if (settings.useIdentifiers && first.modelNumber && second.modelNumber && first.modelNumber.toLowerCase() === second.modelNumber.toLowerCase() && sameBrand) {
    const differences = settings.useSpecs ? differentSpecs(first, second) : [];
    if (differences.length === 0) return { matchClass: "exact", confidence: 98, reason: "The brand, model number, and listed specifications match." };
    return { matchClass: "variant", confidence: 90, reason: variantReason(first, second, differences) };
  }
  if (settings.useBrand && first.brand && second.brand && first.brand.toLowerCase() !== second.brand.toLowerCase()) {
    return { matchClass: "different", confidence: 95, reason: "The brand names are different." };
  }
  if (!settings.useTitle) return { matchClass: "different", confidence: 0, reason: "Title comparison is turned off and no matching identifier was found." };
  const similarity = titleSimilarity(first.title, second.title);
  const confidence = Math.round(similarity * 100);
  const differences = settings.useSpecs ? differentSpecs(first, second) : [];
  if (similarity >= config.exactThreshold && differences.length === 0) return { matchClass: "exact", confidence, reason: "The titles are very close and the listed specifications match." };
  if (similarity >= config.exactThreshold) return { matchClass: "variant", confidence, reason: variantReason(first, second, differences) };
  if (similarity >= config.similarThreshold) return { matchClass: "similar", confidence, reason: "The titles share several words, but the listings are not confirmed as the same item." };
  return { matchClass: "different", confidence, reason: "The titles do not share enough product words." };
}

/** Group exact offers and add a list of related but separate groups. */
function groupOffers(offers) {
  const groups = [];
  for (const offer of offers) {
    let foundGroup = null;
    for (const group of groups) {
      const result = compareOffers(group.offers[0], offer);
      if (result.matchClass === "exact") {
        foundGroup = group;
        offer.matchConfidence = result.confidence;
        break;
      }
    }
    if (foundGroup) foundGroup.offers.push(offer);
    else {
      offer.matchConfidence = 100;
      groups.push({ id: `group-${groups.length + 1}`, title: offer.title, category: offer.category, offers: [offer], relatedProducts: [] });
    }
  }
  for (const group of groups) {
    for (const otherGroup of groups) {
      if (group === otherGroup) continue;
      const result = compareOffers(group.offers[0], otherGroup.offers[0]);
      if (result.matchClass === "variant" || result.matchClass === "similar") {
        group.relatedProducts.push({ title: otherGroup.title, matchClass: result.matchClass, confidence: result.confidence, reason: result.reason });
      }
    }
  }
  return groups;
}

module.exports = { compareOffers, groupOffers };
