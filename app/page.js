/*
This is the PRICORAA home page with a short introduction and starter searches.
The category links and search bar lead to the mock comparison results page.
*/

import SearchBar from "../components/SearchBar";

/** Show the landing page and examples for the three mock-data categories. */
export default function HomePage() {
  return (
    <main className="home-page">
      <section className="hero page-shell">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow"><i /> A clearer way to compare</span>
          <h1>Find the right product.<br /><em>See every price.</em></h1>
          <p className="hero-description">PRICORAA groups the same product across stores, keeps variants separate, and explains why each offer ranks where it does.</p>
          <SearchBar buttonText="Compare prices" />
          <p className="search-hint">Try a product name, brand, or model number.</p>
        </div>
        <div className="hero-visual" aria-label="A sample price comparison summary">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="mini-comparison">
            <div className="mini-card-top"><span className="mini-icon">P</span><span><strong>Galaxy S24 · 128GB</strong><small>4 exact offers found</small></span><span className="match-mark">✓</span></div>
            <div className="mini-offer"><span className="store-dot amazon-dot" />Amazon <strong>₹79,999</strong></div>
            <div className="mini-offer"><span className="store-dot flipkart-dot" />Flipkart <strong>₹75,999</strong></div>
            <div className="mini-offer"><span className="store-dot ebay-dot" />eBay <strong>₹72,240</strong><small>Lowest price</small></div>
            <div className="mini-offer featured-offer"><span className="store-dot meesho-dot" />Meesho <strong>₹72,499</strong><small>Best overall</small></div>
            <div className="mini-foot"><span>Same product, compared fairly</span><span>↗</span></div>
          </div>
          <span className="floating-chip chip-left">✓ Exact matches</span><span className="floating-chip chip-right">₹ Best price</span>
        </div>
      </section>

      <section className="category-section page-shell">
        <div className="section-heading"><div><span className="eyebrow">Start with a category</span><h2>What are you shopping for?</h2></div><span className="section-aside">Three sample categories</span></div>
        <div className="category-grid">
          <a className="category-card" href="/results?category=smartphones"><span className="category-symbol phone-symbol">▯</span><span><strong>Smartphones</strong><small>5 product families</small></span><b>↗</b></a>
          <a className="category-card" href="/results?category=laptops"><span className="category-symbol laptop-symbol">▱</span><span><strong>Laptops</strong><small>5 product families</small></span><b>↗</b></a>
          <a className="category-card" href="/results?category=books"><span className="category-symbol book-symbol">▤</span><span><strong>Books</strong><small>4 product families</small></span><b>↗</b></a>
        </div>
      </section>

      <section className="example-section page-shell">
        <div className="section-heading"><div><span className="eyebrow">A few ideas</span><h2>Try an example search</h2></div></div>
        <div className="example-links">
          <a href="/results?q=Galaxy+S24">Samsung Galaxy S24 <span>→</span></a>
          <a href="/results?q=MacBook+Air+M2">MacBook Air M2 <span>→</span></a>
          <a href="/results?q=Atomic+Habits">Atomic Habits <span>→</span></a>
          <a href="/results?q=Inspiron+5430">Dell Inspiron 5430 <span>→</span></a>
        </div>
      </section>
      <section className="home-bottom page-shell"><span className="bottom-mark">P</span><p>Every match has a reason.<br /><strong>Every rank has a formula.</strong></p><a href="/research">See how it works ↗</a></section>
    </main>
  );
}
