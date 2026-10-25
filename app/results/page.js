/*
This page wraps the interactive results view in a loading boundary.
The client view reads search parameters and asks the local API for mock offers.
*/

import { Suspense } from "react";
import ResultsClient from "../../components/ResultsClient";

/** Render the results view after the browser search parameters are available. */
export default function ResultsPage() {
  return <Suspense fallback={<main className="page-shell"><div className="loading-box">Loading comparison…</div></main>}><ResultsClient /></Suspense>;
}
