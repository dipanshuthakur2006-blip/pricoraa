/*
This component provides a simple search form used on the home and results pages.
It sends the entered words and optional category to the mock search page.
*/

"use client";

import { useState } from "react";

/** Show a search field and navigate to the matching results URL. */
export default function SearchBar({ initialQuery, initialCategory, buttonText }) {
  const [query, setQuery] = useState(initialQuery || "");

  /** Build the results URL when the visitor submits the form. */
  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (initialCategory) params.set("category", initialCategory);
    window.location.href = `/results?${params.toString()}`;
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="product-search">Search products</label>
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input
        id="product-search"
        type="search"
        value={query}
        onChange={function (event) { /* Keep the input value in this component. */ setQuery(event.target.value); }}
        placeholder="Search a product, brand, or model"
      />
      <button className="button button-primary" type="submit">{buttonText || "Compare prices"}</button>
    </form>
  );
}
