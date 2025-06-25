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
    const solvedUrl = `https://solved.ac/api/v3/problem/show?problemId=${problemId}`;
    const solvedRes = await axios.get(solvedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/122.0.0.0 Safari/537.36'
      }
    });

    console.log(solvedRes.data.level);
    const romanNumber = ['0', 'V', 'IV', 'III', 'II', 'I'];
    const tier = (() => {
      let level = solvedRes.data.level;
      if (level <= 5)
        return 'bronze ' + romanNumber[level];
      level -= 5;
      if (level <= 5)
        return 'silver ' + romanNumber[level];
      level -= 5;
      if (level <= 5)
        return 'gold ' + romanNumber[level];
      level -= 5;
      if (level <= 5)
        return 'platinum ' + romanNumber[level];
      level -= 5;
      if (level <= 5)
        return 'diamond ' + romanNumber[level];
      level -= 5;
      if (level <= 5)
        return 'ruby ' + romanNumber[level];            
      return 'error';
    })();

    res.json({
      id: problemId,
      title,
      description,
      input,
      output,
      tier: tier
    });
  } catch (error) {
    console.error('오류:', error.message);
    res.status(500).json({ error: '서버 오류' });
  }
};