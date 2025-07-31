const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: 'Missing ?username=' });
  }

  const url = `https://www.upwork.com/freelancers/${username}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
      const name = document.querySelector('[data-test="freelancer-name"]')?.innerText.trim();
      const title = document.querySelector('[data-test="freelancer-title"]')?.innerText.trim();
      const country = document.querySelector('[data-test="location"]')?.innerText.trim();
      const rate = document.querySelector('[data-test="rate"]')?.innerText.trim();
      const jobSuccess = document.querySelector('[data-test="job-success-score"]')?.innerText.trim();
      return { name, title, country, rate, jobSuccess };
    });

    await browser.close();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
