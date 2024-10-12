const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    const page = await context.newPage();
    let allArticles = []; // Array to store articles from all pages
    let pageNum = 1; // Start from the first page

    while (true) {
        // Navigate to the specified URL with pagination
        await page.goto(`https://archive.4plebs.org/pol/search/text/DEI/start/2023-10-01/end/2023-10-31/page/${pageNum}`, { waitUntil: 'networkidle' });

        // Wait longer for content to load
        await page.waitForTimeout(10000); // Wait for 10 seconds

        // Extract articles
        const articles = await page.$$eval('body.theme_default div.container-fluid > div[role="main"] > article.clearfix.thread > aside.posts article[data-doc-id]', elements => {
            return elements.map(el => el.innerText); // Adjust to extract the desired data
        });

        // Break the loop if no more articles are found
        if (articles.length === 0) break;

        // Accumulate the articles
        allArticles = allArticles.concat(articles);

        console.log(`Page ${pageNum}: ${articles.length} articles found.`);

        // Move to the next page
        pageNum++;
    }

    // Write all articles to a text file
    fs.writeFileSync('10_23all_articles.txt', allArticles.join('\n\n'), 'utf8');
    console.log('All articles have been saved to all_articles.txt');

    await browser.close();
})();

