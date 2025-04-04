const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    const problemId = req.query.id;
  
    try {
      // Fetch BOJ page
      const bojUrl = `https://www.acmicpc.net/problem/${problemId}`;
      const bojRes = await axios.get(bojUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/122.0.0.0 Safari/537.36'
        }
      });
  
      const $boj = cheerio.load(bojRes.data);
      const title = $boj('#problem_title').text().trim();
      const description = $boj('#description').html();
      const input = $boj('#input').html();
      const output = $boj('#output').html();
  
      if (!description || !input || !output || !title) {
        return res.status(404).json({ error: '문제 정보를 찾을 수 없습니다.' });
      }
  
      // Fetch solved.ac tier
      const solvedUrl = `https://solved.ac/search?page=1&query=id%3A${problemId}`;
      const solvedRes = await axios.get(solvedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/122.0.0.0 Safari/537.36'
        }
      });
  
      const $solved = cheerio.load(solvedRes.data);
      const tierImg = $solved('img[alt$="I"], img[alt$="II"], img[alt$="III"], img[alt$="IV"], img[alt$="V"]').first();
      const tierAlt = tierImg.attr('alt') || null; // ex: "Gold IV"
  
      res.json({
        id: problemId,
        title,
        description,
        input,
        output,
        tier: tierAlt
      });
    } catch (error) {
      console.error('오류:', error.message);
      res.status(500).json({ error: '서버 오류' });
    }
  }