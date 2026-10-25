/*
This file holds every adjustable number used by matching, pricing, and ranking.
Change these values here so the rest of the prototype stays easy to read.
*/

/** Shared settings for the prototype. */
const config = {
  usdToInr: 84,
  exactThreshold: 0.75,
  similarThreshold: 0.5,
  baselineThreshold: 0.6,
  // Stop a stalled evaluation request after ten seconds.
  evaluationTimeoutMs: 10000,
  rankingWeights: {
    price: 0.4,
    rating: 0.25,
    delivery: 0.2,
    availability: 0.15
  }
};

module.exports = config;
