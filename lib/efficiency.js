/*
This file measures each offer against the lowest observed price in its exact group.
It uses a simplified version of Kamakura & Moon's lowest observed price idea and summarizes each retailer.
*/

/** Add a like-for-like price efficiency percentage to every offer. */
function addEfficiency(groups) {
  for (const group of groups) {
    const allPrices = [];
    for (const offer of group.offers) {
      allPrices.push(offer.priceINR);
    }
    const frontierPrice = Math.min(...allPrices);
    for (const offer of group.offers) {
      offer.frontierPrice = frontierPrice;
      offer.priceEfficiency = Math.min(100, Math.round((frontierPrice / offer.priceINR) * 100));
    }
  }
  return groups;
}

/** Calculate each retailer's average price efficiency across its offers. */
function retailerSummary(groups) {
  const totals = {};
  const counts = {};
  for (const group of groups) {
    for (const offer of group.offers) {
      if (!totals[offer.retailer]) {
        totals[offer.retailer] = 0;
        counts[offer.retailer] = 0;
      }
      totals[offer.retailer] += offer.priceEfficiency;
      counts[offer.retailer] += 1;
    }
  }
  const summary = [];
  for (const retailer of Object.keys(totals)) {
    summary.push({ retailer, averageEfficiency: Math.round(totals[retailer] / counts[retailer]) });
  }
  return summary.sort(function (first, second) {
    /* Put the most efficient average at the top of the summary. */
    return second.averageEfficiency - first.averageEfficiency;
  });
}

module.exports = { addEfficiency, retailerSummary };
