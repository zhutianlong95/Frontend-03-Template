const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://localhost:8080/main.html')
  const hrefElement = await page.$('a')
  console.log(await a.asElement().boxModel())
})()