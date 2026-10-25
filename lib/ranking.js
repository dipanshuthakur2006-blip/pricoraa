/*
This file scores offers with the same public price, rating, delivery, and stock weights.
It puts available offers first and explains each rank with the two strongest factors.
*/

const config = require("./config");

/** Find the range of a number field among the offers. */
function numberRange(offers, field) {
  const values = offers.map(function (offer) {
    /* Read one field value for the group's range. */
    return offer[field];
  });
  return { minimum: Math.min(...values), maximum: Math.max(...values) };
}

/** Return an offer's unrounded score for all four ranking factors. */
function scoreParts(offer, ranges) {
  let priceScore = 1;
  if (ranges.price.maximum !== ranges.price.minimum) priceScore = (ranges.price.maximum - offer.priceINR) / (ranges.price.maximum - ranges.price.minimum);
  let deliveryScore = 1;
  if (ranges.delivery.maximum !== ranges.delivery.minimum) deliveryScore = 1 - ((offer.deliveryDays - ranges.delivery.minimum) / (ranges.delivery.maximum - ranges.delivery.minimum));
  let availabilityScore = 0;
  if (offer.availability === "in_stock") availabilityScore = 1;
  if (offer.availability === "limited") availabilityScore = 0.5;
  return {
    /* Keep each factor in its valid zero-to-one range. */
    price: Math.max(0, Math.min(1, priceScore)),
    rating: Math.max(0, Math.min(1, offer.rating / 5)),
    delivery: Math.max(0, Math.min(1, deliveryScore)),
    availability: Math.max(0, Math.min(1, availabilityScore))
  };
}

/** Name the two strongest price, rating, and delivery sub-scores. */
function explanationFor(offer) {
  if (offer.availability === "out_of_stock") return "Out of stock, not eligible for top rank";
  const strengths = [
    { name: "price", score: offer.scoreParts.price },
    { name: "rating", score: offer.scoreParts.rating },
    { name: "delivery speed", score: offer.scoreParts.delivery }
  ];
  strengths.sort(function (first, second) {
    /* Put the two highest sub-scores first. */
    return second.score - first.score;
  });
  return `strong ${strengths[0].name} and ${strengths[1].name}`;
}

/** Add scores and rank offers inside each group. */
function rankGroups(groups) {
  for (const group of groups) {
    if (group.offers.length === 0) continue;
    const availableOffers = [];
    for (const offer of group.offers) {
      if (offer.availability === "in_stock" || offer.availability === "limited") availableOffers.push(offer);
    }
    const offersForScoring = availableOffers.length > 0 ? availableOffers : group.offers;
    const ranges = {
      price: numberRange(offersForScoring, "priceINR"),
      delivery: numberRange(offersForScoring, "deliveryDays")
    };
    const weights = config.rankingWeights;
    for (const offer of group.offers) {
      const parts = scoreParts(offer, ranges);
      const total = (parts.price * weights.price) + (parts.rating * weights.rating) + (parts.delivery * weights.delivery) + (parts.availability * weights.availability);
      /* Keep the displayed combined score between zero and one hundred. */
      offer.totalScore = Math.round(Math.max(0, Math.min(100, total * 100)));
      offer.scoreParts = parts;
    }
    group.offers.sort(function (first, second) {
      /* Sort available offers before unavailable ones, then compare their scores. */
      const firstIsAvailable = first.availability === "in_stock" || first.availability === "limited";
      const secondIsAvailable = second.availability === "in_stock" || second.availability === "limited";
      if (firstIsAvailable && !secondIsAvailable) return -1;
      if (!firstIsAvailable && secondIsAvailable) return 1;
      return second.totalScore - first.totalScore;
    });
    for (let index = 0; index < group.offers.length; index += 1) {
      const offer = group.offers[index];
      offer.rank = index + 1;
      if (offer.availability === "out_of_stock") {
        offer.explanation = explanationFor(offer);
      } else {
        offer.explanation = `Ranked #${offer.rank}: ${explanationFor(offer)}.`;
      }
    }
  }
  return groups;
}

module.exports = { rankGroups };
