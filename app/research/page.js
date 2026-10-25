/*
This page explains the data pipeline, scoring formula, research inspirations, and limits.
It distinguishes ideas from the papers from the simplified rules used in this prototype.
*/

import config from "../../lib/config";
import evaluationData from "../../data/evaluation-pairs.json";

const researchItems = [
  {
    name: "David Ronayne (2021)",
    work: "Price Comparison Websites",
    link: "https://onlinelibrary.wiley.com/doi/10.1111/iere.12504",
    idea: "Studies how price-comparison-site fees and transparency affect market outcomes.",
    use: "PRICORAA displays its ranking weights and no-paid-influence policy."
  },
  {
    name: "Wagner A. Kamakura & Sangkil Moon (2009)",
    work: "Quality-adjusted price comparison of non-homogeneous products across Internet retailers",
    link: "https://doi.org/10.1016/j.ijresmar.2009.03.004",
    idea: "Compares unlike retailer assortments using product characteristics and a theoretical price frontier.",
    use: "This prototype first groups exact items, then uses the lowest observed price, even if out of stock, as a simpler reference."
  },
  {
    name: "Kateřina Macková & Martin Pilát (2025 issue)",
    work: "Extended ProMap datasets for product mapping",
    link: "https://doi.org/10.1007/s10660-024-09892-9",
    idea: "Adds close and medium non-match labels to product-mapping datasets.",
    use: "PRICORAA adapts graded non-matches into four labels, then adds feature-ablation and cross-category accuracy checks."
  },
  {
    name: "Navapat Nananukul, Khanin Sisaengsuwanchai & Mayank Kejriwal (2024)",
    work: "Cost-efficient prompt engineering for unsupervised entity resolution in the product matching domain",
    link: "https://doi.org/10.1007/s44163-024-00159-8",
    idea: "Studies prompt patterns and cost for LLM-based product matching.",
    use: "LLM matching is not used here; it remains future work for a larger study."
  },
  {
    name: "Artem Yu. Varnukhov & Dmitry M. Nazarov (2025)",
    work: "Product matching in digital marketplaces: Multimodal model based on the transformer architecture",
    link: "https://doi.org/10.17323/2587-814X.2025.2.7.24",
    idea: "Explores text, visual, and tabular features for marketplace matching.",
    use: "This prototype uses text and structured specifications; image matching is future work."
  }
];

/** Show the plain-language research basis table. */
function ResearchBasis() {
  return (
    <div className="table-scroll research-table-wrap"><table className="research-table"><thead><tr><th>Paper</th><th>Research idea</th><th>What PRICORAA uses</th></tr></thead><tbody>
      {researchItems.map(function (item) {
        /* Link one paper and explain its limited connection to this prototype. */
        return <tr key={item.name}><td><a href={item.link} target="_blank" rel="noreferrer">{item.name} ↗</a><small>{item.work}</small></td><td>{item.idea}</td><td>{item.use}</td></tr>;
      })}
    </tbody></table></div>
  );
}

/** Display the method explanation and research references. */
export default function ResearchPage() {
  const weights = config.rankingWeights;
  return (
    <main className="page-shell document-page research-page">
      <section className="document-hero"><span className="eyebrow">The method, in plain language</span><h1>How PRICORAA<br /><em>works</em></h1><p>A simple pipeline turns messy shop listings into comparable offers, then shows its work.</p></section>
      <section className="content-section pipeline-section">
        <div className="section-heading"><div><span className="eyebrow">From four mock catalogues to one view</span><h2>Comparison pipeline</h2></div></div>
        <div className="pipeline-list">
          <article><span>01</span><div><h3>Read mock listings</h3><p>Four connector files search local JSON. No real pages are scraped and no retailer API is called.</p></div></article>
          <article><span>02</span><div><h3>Normalize the formats</h3><p>Each retailer has different price, rating, stock, and delivery fields. The normalizer converts them into one shared offer shape and rupee price.</p></div></article>
          <article><span>03</span><div><h3>Match and group</h3><p>ISBNs, model numbers, brands, specifications, and title overlap help classify pairs. Only exact offers share a group; variants and similar items remain related products.</p></div></article>
          <article><span>04</span><div><h3>Compare efficiency</h3><p>Each exact group uses its lowest observed price, including out-of-stock listings, as a simplified reference. Every offer's efficiency is that reference divided by its price.</p></div></article>
          <article><span>05</span><div><h3>Score and explain</h3><p>A public weighted score orders offers. Each row shows the score, the rank, and a short explanation of the strongest factors.</p></div></article>
        </div>
      </section>
      <section className="content-section formula-section">
        <div className="section-heading"><div><span className="eyebrow">One formula for every store</span><h2>Ranking formula</h2></div></div>
        <div className="formula-card"><p className="formula-equation">Total score = {Math.round(weights.price * 100)}% × Price + {Math.round(weights.rating * 100)}% × Rating + {Math.round(weights.delivery * 100)}% × Delivery + {Math.round(weights.availability * 100)}% × Availability</p><p>Every sub-score is between 0 and 1. Price, rating, delivery, and stock scores are calculated only among offers for the same exact product.</p>
          <div className="worked-example"><strong>Small example</strong><p>An offer with Price 0.8, Rating 0.9, Delivery 0.5, and Availability 1.0 scores: (0.8 × {weights.price}) + (0.9 × {weights.rating}) + (0.5 × {weights.delivery}) + (1.0 × {weights.availability}) = <b>{Math.round(((0.8 * weights.price) + (0.9 * weights.rating) + (0.5 * weights.delivery) + weights.availability) * 100)} / 100</b>.</p></div>
          <p className="policy-note">No retailer pays for or influences ranking position.</p>
        </div>
      </section>
      <section className="content-section">
        <div className="section-heading"><div><span className="eyebrow">What informed the prototype</span><h2>Research basis</h2></div></div>
        <ResearchBasis />
      </section>
      <section className="content-section limitations-section">
        <div className="section-heading"><div><span className="eyebrow">What this demo cannot prove</span><h2>Limitations</h2></div></div>
        <ul><li><strong>Mock data:</strong> Prices, stock, ratings, delivery times, and links are examples stored in local JSON.</li><li><strong>Simplified efficiency:</strong> The lowest observed price, even when out of stock, is not the theoretical quality-adjusted frontier used in the cited paper.</li><li><strong>Word-overlap similarity:</strong> Jaccard treats title words equally and cannot understand meaning or context.</li><li><strong>Small labeled set:</strong> Evaluation results depend on {evaluationData.pairs.length} hand-labeled pairs and should not be read as production accuracy.</li></ul>
      </section>
    </main>
  );
}
