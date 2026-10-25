/*
This page requests the labeled-pair evaluation from the local evaluation API.
It displays binary metrics, confusion tables, four-class results, and examples.
*/

"use client";

import { useEffect, useState } from "react";
import ConfusionTable from "../../components/ConfusionTable";
import config from "../../lib/config";

/** Render the binary metrics table for both matching methods. */
function MetricsTable({ evaluation }) {
  const rows = [
    { label: "Accuracy", key: "accuracy" },
    { label: "Precision", key: "precision" },
    { label: "Recall", key: "recall" },
    { label: "F1 score", key: "f1" }
  ];
  return (
    <div className="table-scroll"><table className="metrics-table"><thead><tr><th>Metric</th><th>Baseline · title words only</th><th>PRICORAA · full rules</th></tr></thead><tbody>
      {rows.map(function (row) {
        /* Show one binary evaluation metric for both methods. */
        return <tr key={row.key}><th>{row.label}</th><td>{evaluation.baseline.metrics[row.key]}%</td><td><strong>{evaluation.pricoraa.metrics[row.key]}%</strong></td></tr>;
      })}
    </tbody></table></div>
  );
}

/** Fetch the local evaluation response and render its result sections. */
export default function EvaluationPage() {
  const [evaluation, setEvaluation] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [requestNumber, setRequestNumber] = useState(0);

  /** Load evaluation results and stop waiting if the request stalls. */
  useEffect(function () {
    const controller = new AbortController();
    let active = true;
    const timeoutId = setTimeout(function () {
      /* Abort the request so a slow server cannot leave the page loading. */
      controller.abort();
    }, config.evaluationTimeoutMs);
    setIsLoading(true);
    setErrorMessage("");

    /** Request the data and update the page with success or a readable error. */
    async function loadEvaluation() {
      try {
        const response = await fetch("/api/evaluate", { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "The evaluation data could not be loaded.");
        if (result.error) throw new Error(result.error);
        if (active) setEvaluation(result);
      } catch (error) {
        if (active) {
          if (error.name === "AbortError") setErrorMessage("The evaluation request timed out. Please try again.");
          else setErrorMessage(error.message || "The evaluation could not be loaded. Please try again.");
        }
      } finally {
        clearTimeout(timeoutId);
        if (active) setIsLoading(false);
      }
    }

    loadEvaluation();
    return function () {
      /* Stop this request when the page closes or a retry starts. */
      active = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [requestNumber]);

  /** Start a fresh request after an error. */
  function handleRetry() {
    setEvaluation(null);
    setErrorMessage("");
    setIsLoading(true);
    setRequestNumber(requestNumber + 1);
  }

  if (isLoading) return <main className="page-shell evaluation-page"><div className="loading-box" role="status">Calculating evaluation…</div></main>;
  if (errorMessage) return <main className="page-shell evaluation-page"><div className="error-box" role="alert"><p>{errorMessage}</p><button className="button button-primary" type="button" onClick={handleRetry}>Try again</button></div></main>;

  return (
    <main className="page-shell document-page evaluation-page">
      <section className="document-hero"><span className="eyebrow">A small labeled test set</span><h1>Does the matcher compare<br /><em>the same product?</em></h1><p>We compare a title-word baseline with PRICORAA.</p><p>Evaluated on {evaluation.pairCount} hand-labelled pairs from a small mock catalogue. Results show the method works on this data and are not a claim about real e-commerce sites.</p></section>
      <section className="content-section">
        <div className="section-heading"><div><span className="eyebrow">Same vs. not the same</span><h2>Baseline vs PRICORAA</h2></div><span className="section-aside">Binary metrics · exact = same product</span></div>
        <MetricsTable evaluation={evaluation} />
      </section>
      <section className="content-section">
        <div className="section-heading"><div><span className="eyebrow">Where the mistakes happen</span><h2>Confusion tables</h2></div></div>
        <div className="confusion-grid"><ConfusionTable title="Baseline" confusion={evaluation.baseline.confusion} /><ConfusionTable title="PRICORAA" confusion={evaluation.pricoraa.confusion} /></div>
      </section>
      <section className="content-section evaluation-summary-grid">
        <div className="highlight-card"><span className="eyebrow">Four-class prediction</span><strong>{evaluation.fourClassAccuracy}%</strong><p>PRICORAA class accuracy across exact, variant, similar, and different.</p></div>
        <div className="category-accuracy-card"><span className="eyebrow">Cross-category check</span><h2>Accuracy by category</h2><p className="category-accuracy-note">PRICORAA four-class accuracy for each category.</p>
          {evaluation.categoryAccuracy.map(function (item) {
            /* Show one category's four-class accuracy and pair count. */
            const label = item.category.charAt(0).toUpperCase() + item.category.slice(1);
            return <div className="category-accuracy-row" key={item.category}><span>{label}<small>{item.count} pairs</small></span><strong>{item.accuracy}%</strong></div>;
          })}
        </div>
      </section>
      <section className="content-section">
        <div className="section-heading"><div><span className="eyebrow">One feature at a time</span><h2>Feature importance</h2></div><span className="section-aside">Four-class accuracy drop when a rule is switched off</span></div>
        <div className="ablation-card">
          {evaluation.ablationResults.map(function (item) {
            /* Draw an accuracy-change bar for one disabled feature. */
            const safeWidth = Math.min(100, Math.max(0, item.dropPoints));
            return <div className="ablation-row" key={item.label}><span>{item.label}</span><div className="bar-track"><i style={{ width: `${safeWidth}%` }} /></div><strong>{item.dropPoints > 0 ? `−${item.dropPoints}` : item.dropPoints}%</strong><small>{item.accuracy}% without feature</small></div>;
          })}
          <p className="small-note">A negative drop means this small sample scored higher with that feature switched off.</p>
        </div>
      </section>
      <section className="content-section">
        <div className="section-heading"><div><span className="eyebrow">Honest error analysis</span><h2>Where PRICORAA still makes mistakes</h2></div><span className="section-aside">{evaluation.mistakes.length} labeled-class mistakes</span></div>
        {evaluation.mistakes.length === 0 ? <p className="empty-note">PRICORAA made no four-class mistakes on this sample.</p> : (
          <div className="example-pair-list">
            {evaluation.mistakes.map(function (item, index) {
              /* Show every pair whose predicted class differs from its label. */
              return <article className="example-pair" key={`${item.firstTitle}-${index}`}><span className="example-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{item.firstTitle}</h3><p>{item.secondTitle}</p><div className="example-tags"><span>Expected label: {item.expectedLabel}</span><span>Predicted label: {item.predictedLabel}</span></div><small>{item.reason}</small></div></article>;
            })}
          </div>
        )}
      </section>
      <section className="content-section">
        <div className="section-heading"><div><span className="eyebrow">Readable error analysis</span><h2>Baseline misses PRICORAA corrected</h2></div></div>
        {evaluation.examples.length === 0 ? <p className="empty-note">The baseline and PRICORAA made the same binary decisions on this sample.</p> : (
          <div className="example-pair-list">
            {evaluation.examples.slice(0, 8).map(function (item, index) {
              /* Explain one pair where PRICORAA's binary decision was correct. */
              return <article className="example-pair" key={`${item.firstTitle}-${index}`}><span className="example-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{item.firstTitle}</h3><p>{item.secondTitle}</p><div className="example-tags"><span>Expected: {item.expected}</span><span>Baseline: {item.baselinePrediction}</span><span>PRICORAA class: {item.pricoraaClass}</span></div><small>{item.reason}</small></div></article>;
            })}
          </div>
        )}
      </section>
      <p className="prototype-note">This is a small hand-labeled academic sample, not a claim of real-world production accuracy.</p>
    </main>
  );
}
