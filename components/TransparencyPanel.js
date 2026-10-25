/*
This component makes the ranking formula and no-paid-boost policy easy to inspect.
It expands only when the visitor opens the details panel.
*/

import config from "../lib/config";

/** Show the public ranking weights and how the prototype scores offers. */
export default function TransparencyPanel() {
  const weights = config.rankingWeights;
  return (
    <details className="transparency-panel">
      <summary><span><span className="eyebrow">How ranking works</span><strong>See the scoring rules</strong></span><span className="plus-mark">+</span></summary>
      <div className="transparency-content">
        <p>Each offer is scored against the other offers for the same exact product. Price, rating, delivery, and stock each receive a simple 0–1 score.</p>
        <ul className="weight-list">
          <li><span>Price</span><strong>{Math.round(weights.price * 100)}%</strong></li>
          <li><span>Rating</span><strong>{Math.round(weights.rating * 100)}%</strong></li>
          <li><span>Delivery speed</span><strong>{Math.round(weights.delivery * 100)}%</strong></li>
          <li><span>Availability</span><strong>{Math.round(weights.availability * 100)}%</strong></li>
        </ul>
        <p className="policy-note">No retailer pays for or influences ranking position.</p>
      </div>
    </details>
  );
}
