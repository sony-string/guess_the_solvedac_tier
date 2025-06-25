/**
 * 로컬에서 직접 배포하기 위한 express 서버 스크립트
 */

const express = require('express');
const path = require('path');

const problemHandler = require('./api/problem');
const randomProblemsHandler = require('./api/random-problems');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.all('/api/problem', (req, res) => {
  problemHandler(req, res);
});

app.all('/api/random-problems', (req, res) => {
  randomProblemsHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
