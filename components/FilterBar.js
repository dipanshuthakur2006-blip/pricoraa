/*
This component contains the retailer, stock, price, and sort controls.
The results page owns the filter values and decides which rows to show.
*/

/** Render the controls used to narrow and order product offers. */
export default function FilterBar({ filters, onChange }) {
  /** Update one field while keeping the other filter choices. */
  function changeField(field, value) {
    onChange({ ...filters, [field]: value });
  }

  /** Add or remove one retailer from the selected retailer list. */
  function changeRetailer(retailer, checked) {
    let retailers = filters.retailers.slice();
    if (checked && !retailers.includes(retailer)) retailers.push(retailer);
    if (!checked) retailers = retailers.filter(function (item) { /* Remove the unchecked retailer. */ return item !== retailer; });
    changeField("retailers", retailers);
  }

  return (
    <section className="filter-panel" aria-label="Filter product offers">
      <div className="filter-heading"><div><span className="eyebrow">Narrow your comparison</span><h2>Filters</h2></div><button className="text-button" onClick={function () { /* Restore the default filter choices. */ onChange({ retailers: [], inStockOnly: false, maxPrice: "", sortBy: "score" }); }}>Clear all</button></div>
      <div className="filter-grid">
        <fieldset className="filter-field retailer-filter">
          <legend>Retailers</legend>
          {[
            { name: "Amazon", label: "Amazon" },
            { name: "Flipkart", label: "Flipkart" },
            { name: "eBay", label: "eBay" },
            { name: "Meesho", label: "Meesho" }
          ].map(function (retailer) {
            /* Show one retailer checkbox. */
            return <label className="check-option" key={retailer.name}><input type="checkbox" checked={filters.retailers.includes(retailer.name)} onChange={function (event) { /* Apply this retailer checkbox choice. */ changeRetailer(retailer.name, event.target.checked); }} />{retailer.label}</label>;
          })}
        </fieldset>
        <div className="filter-field">
          <label htmlFor="maximum-price">Maximum price</label>
          <div className="input-with-prefix"><span>₹</span><input id="maximum-price" type="number" min="0" value={filters.maxPrice} onChange={function (event) { /* Save the maximum price typed by the visitor. */ changeField("maxPrice", event.target.value); }} placeholder="No limit" /></div>
        </div>
        <div className="filter-field">
          <label htmlFor="sort-offers">Sort offers by</label>
          <select id="sort-offers" value={filters.sortBy} onChange={function (event) { /* Save the requested offer order. */ changeField("sortBy", event.target.value); }}>
            <option value="score">Best score</option><option value="price">Lowest price</option><option value="rating">Highest rating</option><option value="delivery">Fastest delivery</option>
          </select>
        </div>
        <label className="stock-toggle"><input type="checkbox" checked={filters.inStockOnly} onChange={function (event) { /* Save the in-stock choice. */ changeField("inStockOnly", event.target.checked); }} /><span><strong>In-stock only</strong><small>Hide limited and unavailable offers</small></span></label>
      </div>
    </section>
  );
}
