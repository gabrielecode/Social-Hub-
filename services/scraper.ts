import axios from 'axios';
import * as cheerio from 'cheerio';

export const scrapeWebsite = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    // Remove noise
    $('script, style, nav, footer, header, noscript, iframe').remove();

    // Extract core content
    const title = $('h1').text();
    const headers = $('h2, h3').map((_, el) => $(el).text()).get().join('\n');
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const paragraphs = $('p').map((_, el) => $(el).text()).get().join('\n');

    return `
URL: ${url}
Title: ${title}
Meta Description: ${metaDescription}
Headers:
${headers}
Content:
${paragraphs}
`.substring(0, 10000); // Limit context size
  } catch (error) {
    console.error('Scraping error:', error);
    return `Could not scrape content from ${url}.`;
  }
};
