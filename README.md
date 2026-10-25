<!--
This guide explains how to run and present the PRICORAA academic prototype.
It summarizes the pipeline, every library file, the ranking math, and common viva questions.
-->

# PRICORAA: Smart Price Comparison System

PRICORAA is a small web prototype that compares sample offers from Amazon, Flipkart, eBay, and Meesho. It groups exact product matches, keeps variants separate, and shows how each offer was ranked.

All retailer data is local mock JSON. The project does not scrape websites or call retailer APIs. The footer says **“Demo data for academic prototype”** so the sample offers are clear to visitors.

## Run the project

Use Node.js and npm, then run these commands from this project folder:

```bash
npm install
npm run dev
```

Open the local address printed by Next.js. To create a production build, run:

```bash
npm run build
npm start
```

## What the pages show

- **Home:** product search, category links, and example searches.
- **Results:** retailer offers, filters, exact groups, related variants, price efficiency, scores, and reasons.
- **Evaluation:** a title-word baseline compared with PRICORAA on 34 labeled pairs.
- **Research:** a plain-language pipeline, formula, research basis, and limitations.

## Pipeline diagram

```text
Search words + optional category
              |
              v
Amazon JSON  Flipkart JSON  eBay JSON  Meesho JSON
       \          |            |          /
        +---------+------------+---------+
                          |
                          v
                 Normalize each format
                          |
                          v
               Match pairs and group exacts
                          |
                          v
        Lowest observed price efficiency per group
                          |
                          v
         Weighted ranking, reasons, and JSON response
                          |
                          v
               Results page and evaluation
```

## Library files in plain English

- `lib/config.js` holds every adjustable threshold, ranking weight, and the USD-to-INR example rate. Change the values here instead of searching through the project.
- `lib/connectors/amazon.js` reads and filters the Amazon-shaped mock data.
- `lib/connectors/flipkart.js` reads and filters the Flipkart-shaped mock data.
- `lib/connectors/ebay.js` reads and filters the eBay-shaped mock data.
- `lib/connectors/meesho.js` reads and filters the Meesho-shaped mock data.
- `lib/connectors/index.js` calls all four connectors and marks each result with its retailer name.
- `lib/normalize.js` changes the four raw data shapes into one shared offer shape. It converts dollars to rupees, ratings to a five-point scale, stock labels, and delivery ranges.
- `lib/similarity.js` cleans title words and calculates Jaccard similarity.
- `lib/matcher.js` checks categories, accessories, ISBNs, model numbers, brands, specifications, and title similarity. It groups only exact matches and lists variants or similar products separately.
- `lib/efficiency.js` finds the lowest observed price, including out-of-stock offers, in each exact group. It calculates offer efficiency and summarizes retailers.
- `lib/ranking.js` scores and orders offers using the shared weights, then writes a short reason for each rank.
- `lib/evaluation.js` validates pair IDs and calculates the binary metrics, four-class accuracy, category accuracy, ablation results, and example errors.

## Ranking formula

Each sub-score is between 0 and 1. For one exact product group:

```text
Total score = (Price × 0.40) + (Rating × 0.25) + (Delivery × 0.20) + (Availability × 0.15)
```

The score shown on the page is the total multiplied by 100 and rounded to a whole number. If an offer has a price score of `0.8`, rating score `0.9`, delivery score `0.5`, and availability score `1.0`, then:

```text
(0.8 × 0.40) + (0.9 × 0.25) + (0.5 × 0.20) + (1.0 × 0.15)
= 0.32 + 0.225 + 0.10 + 0.15
= 0.795, or 80 out of 100 after rounding
```

Price and delivery scores are scaled against the offers in that exact group. The availability score is `1` for in stock, `0.5` for limited stock, and `0` when unavailable. The same weights apply to every retailer; there is no paid boost.

Price efficiency is separate from ranking:

```text
Price efficiency = lowest observed price in the exact group / offer price × 100
```

This is a classroom-friendly simplification. It is not a learned or quality-adjusted theoretical price frontier.

## Evaluation notes

`data/evaluation-pairs.json` contains labeled pairs distributed across exact, variant, similar, and different categories. The baseline predicts “same” when title Jaccard similarity reaches the configured baseline threshold. PRICORAA predicts “same” only for the `exact` class. Binary accuracy, precision, recall, and F1 use that same/not-same interpretation. Four-class and per-category accuracy use all four PRICORAA labels.

The sample is small and hand-labeled to demonstrate the rules. Its scores are for the classroom prototype and do not represent expected production performance.

## Research basis

- Ronayne (2021), [Price Comparison Websites](https://onlinelibrary.wiley.com/doi/10.1111/iere.12504), studies fees and transparency in price-comparison websites. The prototype makes its ranking weights and policy visible.
- Kamakura and Moon (2009), [Quality-adjusted price comparison of non-homogeneous products across Internet retailers](https://doi.org/10.1016/j.ijresmar.2009.03.004), studies price comparisons that account for product characteristics. This prototype uses exact groups and a much simpler observed-price reference.
- Macková and Pilát, [Extended ProMap datasets for product mapping](https://doi.org/10.1007/s10660-024-09892-9), introduce graded non-match categories. PRICORAA adapts that idea into four labels and adds feature-ablation and cross-category accuracy checks.
- Nananukul, Sisaengsuwanchai, and Kejriwal (2024), [Cost-efficient prompt engineering for unsupervised entity resolution in the product matching domain](https://doi.org/10.1007/s44163-024-00159-8), evaluate LLM prompt patterns and cost. LLM matching is not part of this prototype.
- Varnukhov and Nazarov (2025), [Product matching in digital marketplaces](https://doi.org/10.17323/2587-814X.2025.2.7.24), explore text, image, and tabular information. PRICORAA uses text and structured specifications; image matching is future work.

## Ten likely viva questions

1. **What problem does PRICORAA solve?** It helps compare retailer offers for the same product without mixing in different variants.
2. **Why normalize retailer data?** Each mock retailer stores price, rating, stock, and delivery in a different format, so one shared shape makes comparison possible.
3. **What is an exact match?** Two listings that the rules identify as the same product, using identifiers or sufficiently close titles and matching specifications.
4. **How is a variant different from an exact match?** A variant belongs to the same product family but differs in a meaningful field such as storage, condition, or book format.
5. **What is Jaccard similarity?** The number of shared unique title words divided by the number of unique words in either title.
6. **Why group exact products before comparing prices?** A 128 GB phone should not be ranked against a 256 GB phone as if they were identical.
7. **How is price efficiency calculated?** The lowest observed price in an exact group, including out-of-stock offers, divided by each offer's price, times 100.
8. **How is the best offer ranked?** It receives a weighted score from price, rating, delivery speed, and availability.
9. **What does the evaluation baseline do?** It calls listings the same product when their title-word Jaccard score reaches the configured threshold.
10. **What are the main limitations?** The data is mocked, the similarity rule is simple, the efficiency reference is simplified, and the evaluation set is small.
