/*
This file collects listings from all four local mock retailers.
It keeps each retailer's raw fields intact for the normalization step.
*/

const amazon = require("./amazon");
const flipkart = require("./flipkart");
const ebay = require("./ebay");
const meesho = require("./meesho");

/** Combine the matching raw listings from every connector. */
function getAllListings(query, category) {
  const listings = [];
  const amazonListings = amazon.getListings(query, category);
  const flipkartListings = flipkart.getListings(query, category);
  const ebayListings = ebay.getListings(query, category);
  const meeshoListings = meesho.getListings(query, category);
  for (const listing of amazonListings) listings.push({ ...listing, retailer: "Amazon" });
  for (const listing of flipkartListings) listings.push({ ...listing, retailer: "Flipkart" });
  for (const listing of ebayListings) listings.push({ ...listing, retailer: "eBay" });
  for (const listing of meeshoListings) listings.push({ ...listing, retailer: "Meesho" });
  return listings;
}

module.exports = { getAllListings };
