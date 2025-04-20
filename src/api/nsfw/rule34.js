const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept':
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
  },
};

async function rule34(q) {
  try {
    const { data } = await axios.get(
      `https://rule34.xxx/index.php?page=post&s=list&tags=${encodeURIComponent(q)}`,
      headers
    );
    const $ = cheerio.load(data);
    const results = [];

    $('span.thumb').each((i, el) => {
      const aTag = $(el).find('a');
      const imgTag = $(el).find('img');

      const postId = aTag.attr('id')?.replace('p', '');
      const postUrl = `https://rule34.xxx${aTag.attr('href')}`;
      const imageUrl = imgTag.attr('src');
      const title = imgTag.attr('title') || '';
      const tags = imgTag.attr('alt')?.split(' ') || [];

      results.push({
        id: postId,
        link: postUrl,
        image: imageUrl?.startsWith('//') ? 'https:' + imageUrl : imageUrl,
        title: title.trim(),
        tags: tags.filter(t => t),
      });
    });

    return results;
  } catch (err) {
    console.error('Failed to fetch:', err.message);
    return [];
  }
}

module.exports = function (app) {
  app.get('/api/rule34', async (req, res) => {
    const q = req.query.q;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query param "q" is required.' });
    }

    const result = await rule34(q);
    res.json(result);
  });
};
