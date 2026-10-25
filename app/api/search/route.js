/*
This route runs the local mock-data comparison pipeline for a search request.
It returns exact groups, related products, efficiency, ranking, and store summaries.
*/

import { getAllListings } from "../../../lib/connectors";
import { normalizeListing } from "../../../lib/normalize";
import { groupOffers } from "../../../lib/matcher";
import { addEfficiency, retailerSummary } from "../../../lib/efficiency";
import { rankGroups } from "../../../lib/ranking";

/** Handle GET /api/search?q=&category= with the local mock listings. */
export async function GET(request) {
  const search = new URL(request.url).searchParams;
  const query = search.get("q") || "";
  const category = search.get("category") || "";
  const rawListings = getAllListings(query, category);
  const offers = [];
  for (const raw of rawListings) offers.push(normalizeListing(raw.retailer, raw));
  const groups = groupOffers(offers);
  addEfficiency(groups);
  rankGroups(groups);
  return Response.json({ query, category, totalOffers: offers.length, groups, retailerSummary: retailerSummary(groups) });
}
