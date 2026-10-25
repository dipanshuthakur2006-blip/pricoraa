/*
This file evaluates keyword matching against PRICORAA on labeled mock listing pairs.
It also reports four-class matching, per-category accuracy, and one-feature ablations.
*/

const fs = require("fs");
const path = require("path");
const config = require("./config");
const { getAllListings } = require("./connectors");
const { normalizeListing } = require("./normalize");
const { titleSimilarity } = require("./similarity");
const { compareOffers } = require("./matcher");

/** Read and parse the labeled pair file from the project data folder. */
function readPairs() {
  const filePath = path.join(process.cwd(), "data", "evaluation-pairs.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8")).pairs;
}

/** Turn one numeric fraction into a percentage rounded to one decimal place. */
function asPercent(value) {
  return Math.round(value * 1000) / 10;
}

/** Count binary outcomes and calculate accuracy, precision, recall, and F1. */
function binaryMetrics(actual, predicted) {
  let truePositive = 0;
  let falsePositive = 0;
  let trueNegative = 0;
  let falseNegative = 0;
  for (let index = 0; index < actual.length; index += 1) {
    if (actual[index] && predicted[index]) truePositive += 1;
    else if (!actual[index] && predicted[index]) falsePositive += 1;
    else if (!actual[index] && !predicted[index]) trueNegative += 1;
    else falseNegative += 1;
  }
  const total = actual.length || 1;
  const precision = truePositive + falsePositive === 0 ? 0 : truePositive / (truePositive + falsePositive);
  const recall = truePositive + falseNegative === 0 ? 0 : truePositive / (truePositive + falseNegative);
  const f1 = precision + recall === 0 ? 0 : 2 * precision * recall / (precision + recall);
  return {
    truePositive,
    falsePositive,
    trueNegative,
    falseNegative,
    accuracy: asPercent((truePositive + trueNegative) / total),
    precision: asPercent(precision),
    recall: asPercent(recall),
    f1: asPercent(f1)
  };
}

/** Make a two by two table with actual labels on rows and predictions on columns. */
function confusionTable(actual, predicted) {
  const cells = [[0, 0], [0, 0]];
  for (let index = 0; index < actual.length; index += 1) {
    const actualIndex = actual[index] ? 0 : 1;
    const predictedIndex = predicted[index] ? 0 : 1;
    cells[actualIndex][predictedIndex] += 1;
  }
  return { labels: ["Same", "Not same"], cells };
}

/** Calculate the fraction of predicted four-class labels that match the gold labels. */
function classAccuracy(pairs, predictions) {
  let correct = 0;
  for (let index = 0; index < pairs.length; index += 1) {
    if (pairs[index].label === predictions[index]) correct += 1;
  }
  return asPercent(correct / (pairs.length || 1));
}

/** Check all pair ids and stop with a helpful message when a mock id is missing. */
function validatePairIds(pairs, offersById) {
  for (const pair of pairs) {
    if (!offersById[pair.a]) throw new Error(`Evaluation pair refers to missing mock offer id: ${pair.a}`);
    if (!offersById[pair.b]) throw new Error(`Evaluation pair refers to missing mock offer id: ${pair.b}`);
  }
}

/** Build the complete evaluation response from the current mock dataset. */
function getEvaluation() {
  const rawListings = getAllListings("");
  const offersById = {};
  for (const raw of rawListings) offersById[raw.id] = normalizeListing(raw.retailer, raw);
  const pairs = readPairs();
  validatePairIds(pairs, offersById);
  const baselinePredictions = [];
  const pricoraaPredictions = [];
  const comparisonResults = [];
  const binaryActual = [];
  const baselineBinary = [];
  const pricoraaBinary = [];
  for (const pair of pairs) {
    const first = offersById[pair.a];
    const second = offersById[pair.b];
    const baselineMatch = titleSimilarity(first.title, second.title) >= config.baselineThreshold;
    const result = compareOffers(first, second);
    baselinePredictions.push(baselineMatch ? "exact" : "different");
    pricoraaPredictions.push(result.matchClass);
    comparisonResults.push({ pair, first, second, result, baselineMatch });
    binaryActual.push(pair.label === "exact");
    baselineBinary.push(baselineMatch);
    pricoraaBinary.push(result.matchClass === "exact");
  }
  const baselineMetrics = binaryMetrics(binaryActual, baselineBinary);
  const pricoraaMetrics = binaryMetrics(binaryActual, pricoraaBinary);
  const baseFourClassAccuracy = classAccuracy(pairs, pricoraaPredictions);
  const categoryAccuracy = [];
  for (const category of ["smartphones", "laptops", "books"]) {
    const categoryPairs = [];
    const categoryPredictions = [];
    for (let index = 0; index < pairs.length; index += 1) {
      if (offersById[pairs[index].a].category === category) {
        categoryPairs.push(pairs[index]);
        categoryPredictions.push(pricoraaPredictions[index]);
      }
    }
    categoryAccuracy.push({ category, count: categoryPairs.length, accuracy: classAccuracy(categoryPairs, categoryPredictions) });
  }
  const ablationResults = [];
  const ablationOptions = [
    { key: "useIdentifiers", label: "Identifiers" },
    { key: "useBrand", label: "Brand" },
    { key: "useSpecs", label: "Specifications" },
    { key: "useTitle", label: "Title similarity" }
  ];
  for (const option of ablationOptions) {
    const predictions = [];
    for (const pair of pairs) {
      const result = compareOffers(offersById[pair.a], offersById[pair.b], { [option.key]: false });
      predictions.push(result.matchClass);
    }
    const accuracy = classAccuracy(pairs, predictions);
    ablationResults.push({ label: option.label, accuracy, dropPoints: Math.round((baseFourClassAccuracy - accuracy) * 10) / 10 });
  }
  const examples = [];
  const mistakes = [];
  for (let index = 0; index < comparisonResults.length; index += 1) {
    const item = comparisonResults[index];
    if (item.result.matchClass !== item.pair.label) {
      mistakes.push({
        firstTitle: item.first.title,
        secondTitle: item.second.title,
        expectedLabel: item.pair.label,
        predictedLabel: item.result.matchClass,
        reason: item.result.reason
      });
    }
    const expectedSame = item.pair.label === "exact";
    const baselineWasRight = item.baselineMatch === expectedSame;
    const pricoraaWasRight = (item.result.matchClass === "exact") === expectedSame;
    if (!baselineWasRight && pricoraaWasRight) {
      examples.push({
        firstTitle: item.first.title,
        secondTitle: item.second.title,
        expected: expectedSame ? "Same product" : "Not the same product",
        baselinePrediction: item.baselineMatch ? "Same product" : "Not the same product",
        pricoraaClass: item.result.matchClass,
        reason: item.result.reason
      });
    }
  }
  return {
    pairCount: pairs.length,
    baseline: { metrics: baselineMetrics, confusion: confusionTable(binaryActual, baselineBinary) },
    pricoraa: { metrics: pricoraaMetrics, confusion: confusionTable(binaryActual, pricoraaBinary) },
    fourClassAccuracy: baseFourClassAccuracy,
    categoryAccuracy,
    ablationResults,
    examples,
    mistakes
  };
}

module.exports = { getEvaluation };
