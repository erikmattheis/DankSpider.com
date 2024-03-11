const axios = require("axios");
const cheerio = require("cheerio");
const config = require("./domains/wnc-cbd.com/config.json");
const fs = require("fs");

function saveResponse(response, directory, fileName) {
  fs.writeFile(`./domains/${directory}/${fileName}.html`, response, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("File created");
  });
}

function saveProducts(products) {
  // Save the products to a database, file, etc.
  console.log(products);
}

const puppeteer = require("puppeteer");

function extractElementDetail($, element, detail) {
  if (detail === "text") {
    return $(element).text();
  } else {
    return $(element).attr(detail);
  }
}

async function scrapeData() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("http://example.com");

  // Click the element that causes the value to be displayed.
  await page.click("clickSelector");

  // Wait for the value to be displayed.
  await page.waitForSelector("valueSelector");

  // Scrape the value.
  const value = await page.evaluate((selector) => {
    return document.querySelector(selector).innerText;
  }, "valueSelector");

  console.log(value);

  await browser.close();
}

scrapeData();

async function scrapePage(url) {
  let productLinks = [];
  let currentPageUrl = url;

  while (currentPageUrl) {
    const response = await axios.get(currentPageUrl);
    const $ = cheerio.load(response.data);

    saveResponse(response.data, config.localDirectory, "products");

    // Collect product links from the current page
    $(config.selectors.productLink).each((_, element) => {
      const productLink = $(element).attr("href");
      console.log(productLink);
      productLinks.push(productLink);
    });

    // Attempt to find the next page URL
    const nextPageUrl = $(config.selectors.paginationNext).attr("href");
    currentPageUrl = nextPageUrl
      ? `https://${config.domain}${nextPageUrl}`
      : null;
  }

  return productLinks;
}

function extractProduct($, element) {
  const { selectors } = config;
  const product = {};
  console.log("looking for", selectors.productTitle);
  product.title = $(element).find(selectors.productTitle).text().trim();
  console.log(product.title);
  product.image = $(element).find(selectors.image).attr("src");
  console.log(product.image);
  product.properties = [];
  for (const property of selectors.properties)
    $(element)
      .find(property.selector)
      .each((_, propElement) => {
        const value = $(propElement)
          .find(selectors.propertyValue)
          .text()
          .trim();

        if (!product.properties[property.name]) {
          product.properties[property.name] = [];
        }
        product.properties[property.name].push(value);
      });
  return product;
}

async function getProductDetails(url) {
  const { selectors } = config;

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  saveResponse(response.data, config.localDirectory, "product");

  const product = extractProduct($, selectors.productContainer);

  saveProducts(product);
}

async function scrape() {
  const productLinks = await scrapePage(config.startUrl);
  const productDetails = [];

  for (const productLink of productLinks) {
    console.log(`Scraping product details from ${productLink}`);
    const details = await getProductDetails(productLink);
    if (details) {
      productDetails.push(details);
    }
  }
  // Save or process the collected product detail
}

scrape();
