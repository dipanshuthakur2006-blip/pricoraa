/*
This component summarizes each retailer's average price-efficiency percentage.
Its values are computed from exact groups so variant prices stay separate.
*/

/** Show the sorted retailer efficiency summary. */
export default function RetailerSummary({ retailers }) {
  return (
    <section className="summary-card">
      <div className="summary-heading"><span className="eyebrow">Like-for-like price check</span><h2>Retailer price efficiency</h2><p>Average against the lowest observed offer price in each exact product group.</p></div>
      {retailers.length === 0 ? <p>No retailer offers are available for this search.</p> : (
        <ul className="retailer-summary-list">
          {retailers.map(function (item) {
            /* Draw one retailer's average efficiency bar. */
            return <li key={item.retailer}><span>{item.retailer}</span><div className="bar-track"><i style={{ width: `${item.averageEfficiency}%` }} /></div><strong>{item.averageEfficiency}%</strong></li>;
          })}
        </ul>
      )}
    </section>
  );
}
