/*
This component displays retailer offers side by side in a readable table.
It marks the best available and cheapest available offers and greys out unavailable rows.
*/

import ScoreBadge from "./ScoreBadge";

/** Format a numeric rupee amount with Indian digit grouping. */
function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

/** Turn a stock code into plain language for the table. */
function availabilityText(value) {
  if (value === "in_stock") return "In stock";
  if (value === "limited") return "Limited";
  return "Out of stock";
}

/** Render the offer rows and their transparent score details. */
export default function OfferTable({ offers, lowestPrice }) {
  return (
    <div className="table-scroll">
      <table className="offer-table">
        <thead>
          <tr><th>Retailer</th><th>Price</th><th>Rating</th><th>Availability</th><th>Delivery</th><th>Match %</th><th>Price efficiency</th><th>Score</th><th>Store</th></tr>
        </thead>
        <tbody>
          {offers.map(function (offer) {
            /* Show one row with its match, price, and ranking information. */
            return (
              <tr key={offer.id} className={offer.availability === "out_of_stock" ? "offer-row-out-of-stock" : ""}>
                <td>
                  <strong>{offer.retailer}</strong>
                  {offer.rank === 1 && offer.availability !== "out_of_stock" ? <span className="table-badge best-badge">Best overall</span> : null}
                  {(offer.availability === "in_stock" || offer.availability === "limited") && offer.priceINR === lowestPrice ? <span className="table-badge low-badge" title="Lowest price among available offers">Lowest price</span> : null}
                </td>
                <td className="price-cell">{formatPrice(offer.priceINR)}</td>
                <td>{offer.rating.toFixed(1)} / 5</td>
                <td><span className={`availability availability-${offer.availability}`}>{availabilityText(offer.availability)}</span></td>
                <td>{offer.deliveryDays} days</td>
                <td>{offer.matchConfidence}%</td>
                <td>{offer.priceEfficiency}%</td>
                <td><ScoreBadge score={offer.totalScore} rank={offer.rank} /></td>
                <td><a className="visit-link" href={offer.url} target="_blank" rel="noreferrer">{offer.availability === "out_of_stock" ? "View listing ↗" : "Visit store ↗"}</a></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
