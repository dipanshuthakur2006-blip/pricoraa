/*
This is the shared page layout with navigation and the academic-demo footer.
It also loads the one global plain CSS file and sets page metadata.
*/

import "./globals.css";

export const metadata = {
  title: "PRICORAA | Smart Price Comparison System",
  description: "A transparent academic prototype for comparing mock retailer prices."
};

/** Wrap every page with the PRICORAA header and demo-data footer. */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="nav-shell">
            <a className="brand-lockup" href="/" aria-label="PRICORAA home"><span className="brand-mark">P</span><span>PRICORAA<small>SMART PRICE COMPARISON</small></span></a>
            <nav className="main-nav" aria-label="Main navigation"><a href="/results">Compare</a><a href="/evaluation">Evaluation</a><a href="/research">Research</a></nav>
            <a className="nav-cta" href="/results">Start comparing <span>↗</span></a>
          </div>
        </header>
        {children}
        <footer className="site-footer"><div className="footer-inner"><a className="footer-brand" href="/">PRICORAA</a><p>Transparent comparisons for everyday decisions.</p><span>Demo data for academic prototype</span></div></footer>
      </body>
    </html>
  );
}
