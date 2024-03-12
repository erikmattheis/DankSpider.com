const axios = require("axios");
const cheerio = require("cheerio");
const config = require("./domains/wnc-cbd.com/config.json");
const fs = require("fs");
const puppeteer = require("puppeteer");

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

async function headlessBrowser(html = "<h1>Hello, world!</h1>") {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html);

  const h1Text = await page.evaluate(
    () => document.querySelector("h1").innerText,
  );
  console.log(h1Text); // Outputs: 'Hello, world!'

  await browser.close();
}

headlessBrowser();

function extractElementDetail($, element, detail) {
  if (detail === "text") {
    return $(element).text();
  } else {
    return $(element).attr(detail);
  }
}

async function get() {
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

async function getProductsLinks(url) {
  let urls = [];
  let currentPageUrl = url;

  while (currentPageUrl) {
    const response = await axios.get(currentPageUrl);
    const $ = cheerio.load(response.data);

    saveResponse(response.data, config.localDirectory, "products");

    $(config.selectors.url).each((_, element) => {
      const productLink = $(element).attr("href");
      console.log(productLink);
      urls.push(productLink);
    });

    // Attempt to find the next page URL
    const nextPageUrl = $(config.selectors.paginationNext).attr("href");
    currentPageUrl = nextPageUrl
      ? `https://${config.domain}${nextPageUrl}`
      : null;
  }

  return urls;
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

async function getProductDetails(config) {
  const response = await axios.get(config.url);

  const $ = cheerio.load(response.data);

  saveResponse(response.data, config.localDirectory, "product");

  const product = extractProduct($, selectors.productContainer);

  saveProduct(product);
}

async function scrape() {
  const urls = await getProductsLinks(config);
  const products = [];

  for (const url of urls) {
    console.log(`Scraping product details from ${productLink}`);
    const details = await getProductDetails(productLink);
    if (details) {
      products.push(details);
    }
  }
  // Save or process the collected product detail
}

scrape();
