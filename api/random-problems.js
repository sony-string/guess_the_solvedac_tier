const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    try {
        const minTier = req.query.min || 'b5';
        const maxTier = req.query.max || 'r1';
        const query = `*${minTier}..${maxTier}`;
        const searchUrl = `https://solved.ac/problems?query=${encodeURIComponent(query)}+lang%3Ako&sort=random&direction=asc`;
        console.log(searchUrl);

        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                    'Chrome/122.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const problems = [];

        $('tr.css-1ojb0xa').each((_, el) => {
            const anchor = $(el).find('a[href*="/problem/"]');
            const href = anchor.attr('href'); // /problem/8381
            if (href) {
                const idMatch = href.match(/\/problem\/(\d+)/);
                if (idMatch) {
                    problems.push(parseInt(idMatch[1]));
                }
            }
        });

        res.json({ problemIds: problems.slice(0, parseInt(req.query.count)) }); // 최대 10개
    } catch (err) {
        console.error('무작위 문제 불러오기 실패:', err.message);
        res.status(500).json({ error: '문제 불러오기 실패' });
    }
};