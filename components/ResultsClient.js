/*
This client component loads search results and applies the visitor's filters.
All comparison and ranking work stays in the local search API route.
*/

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import ProductGroupCard from "./ProductGroupCard";
import RetailerSummary from "./RetailerSummary";
import TransparencyPanel from "./TransparencyPanel";

/** Sort one visible offer list using the selected order. */
function sortOffers(offers, sortBy) {
  const sorted = offers.slice();
  sorted.sort(function (first, second) {
    /* Compare the requested offer field with a plain if statement. */
    if (sortBy === "price") return first.priceINR - second.priceINR;
    if (sortBy === "rating") return second.rating - first.rating;
    if (sortBy === "delivery") return first.deliveryDays - second.deliveryDays;
    return second.totalScore - first.totalScore;
  });
  return sorted;
}

/** Load the query, filter offers, and display product groups. */
export default function ResultsClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState({ retailers: [], inStockOnly: false, maxPrice: "", sortBy: "score" });

  /** Fetch the current search from the local mock-data API. */
  useEffect(function () {
    /* Mark this request inactive when the query changes or the page closes. */
    let active = true;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    fetch(`/api/search?${params.toString()}`)
      .then(function (response) {
        /* Turn non-success HTTP responses into a readable message. */
        if (!response.ok) throw new Error("The search could not be loaded.");
        return response.json();
      })
      .then(function (result) {
        /* Ignore a result if the search page has already changed. */
        if (active) setData(result);
      })
      .catch(function (error) {
        /* Show a short message when the local API fails. */
        if (active) setErrorMessage(error.message);
      });
    return function () {
      /* Stop this request from updating an unmounted view. */
      active = false;
    };
  }, [query, category]);

  let visibleGroups = [];
  let visibleOffers = 0;
  if (data) {
    for (const group of data.groups) {
      let offers = group.offers.filter(function (offer) {
        /* Keep only offers that pass every current filter. */
        if (filters.retailers.length > 0 && !filters.retailers.includes(offer.retailer)) return false;
        if (filters.inStockOnly && offer.availability !== "in_stock") return false;
        if (filters.maxPrice && offer.priceINR > Number(filters.maxPrice)) return false;
        return true;
      });
      offers = sortOffers(offers, filters.sortBy);
      if (offers.length > 0) {
        visibleGroups.push({ group, offers });
        visibleOffers += offers.length;
      }
    }
  }
  const categoryLabel = category ? category.charAt(0).toUpperCase() + category.slice(1) : "All categories";

  return (
    <main className="page-shell results-page">
      <section className="results-intro">
        <div><span className="eyebrow">Local mock catalogue</span><h1>Compare product offers</h1><p>Search titles and brands across the four sample retailer catalogues.</p></div>
        <SearchBar initialQuery={query} initialCategory={category} />
      </section>
      {errorMessage ? <div className="error-box">{errorMessage}</div> : null}
      {!data && !errorMessage ? <div className="loading-box">Loading mock offers…</div> : null}
      {data ? (
        <>
          <div className="results-meta"><span>{visibleOffers} {visibleOffers === 1 ? "offer" : "offers"} across {visibleGroups.length} {visibleGroups.length === 1 ? "product group" : "product groups"}</span><span>{categoryLabel}{query ? ` · Search: “${query}”` : ""}</span></div>
          <div className="results-layout">
            <aside><FilterBar filters={filters} onChange={setFilters} /><RetailerSummary retailers={data.retailerSummary} /><TransparencyPanel /></aside>
            <section className="group-list" aria-label="Product comparison groups">
              {visibleGroups.length === 0 ? <div className="empty-state"><h2>No offers found</h2><p>Try another search or clear a filter.</p></div> : null}
              {visibleGroups.map(function (item) {
                /* Show one exact product group and its currently visible offers. */
                return <ProductGroupCard key={item.group.id} group={item.group} offers={item.offers} />;
              })}
            </section>
          </div>
          <p className="prototype-note">Price efficiency compares only exact product groups. Similar and variant items stay separate.</p>
        </>
      ) : null}
    </main>
  );
}
