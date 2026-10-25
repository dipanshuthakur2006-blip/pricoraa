/*
This component shows one exact-match product group with its offers and related items.
Related variants and similar products stay separate so shoppers can see the difference.
*/

import OfferTable from "./OfferTable";

/** Display one grouped product and its related non-identical listings. */
export default function ProductGroupCard({ group, offers }) {
  let lowestPrice = Infinity;
  let allOffersOutOfStock = group.offers.length > 0;
  for (const offer of group.offers) {
    const isAvailable = offer.availability === "in_stock" || offer.availability === "limited";
    if (isAvailable) allOffersOutOfStock = false;
    if (isAvailable && offer.priceINR < lowestPrice) {
      lowestPrice = offer.priceINR;
    }
  }
  const categoryName = group.category.charAt(0).toUpperCase() + group.category.slice(1);

  return (
    <article className="product-card">
      <div className="product-card-heading">
        <div>
          <span className="eyebrow">{categoryName} · {offers.length} {offers.length === 1 ? "offer" : "offers"}</span>
          <h2>{group.title}</h2>
        </div>
        <div className="product-group-badges">
          <span className="group-tag">{group.offers.length === 1 ? "Only 1 offer found" : "Exact product group"}</span>
          {allOffersOutOfStock ? <span className="unavailable-group-tag">Currently unavailable</span> : null}
        </div>
      </div>
      {offers.length > 0 ? (
        <>
          <OfferTable offers={offers} lowestPrice={lowestPrice} />
          <p className="ranking-note">Rankings compare available offers only.</p>
        </>
      ) : <p>No offers match these filters.</p>}
      <div className="explanations">
        {offers.map(function (offer) {
          /* Explain the strongest factors behind each visible offer's rank. */
          return <p key={offer.id}><strong>{offer.retailer}:</strong> {offer.explanation}</p>;
        })}
      </div>
      {group.relatedProducts.length > 0 ? (
        <div className="related-list">
          <h3>Related products <span>(not the same item)</span></h3>
          <ul>
            {group.relatedProducts.map(function (related, index) {
              /* Keep related products separate and give the comparison reason. */
              return <li key={`${related.title}-${index}`}><span className={`class-tag class-${related.matchClass}`}>{related.matchClass}</span><strong>{related.title}</strong><span>{related.reason}</span></li>;
            })}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
