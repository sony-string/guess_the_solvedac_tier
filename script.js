const startBtn = document.getElementById('start-btn');
const mainView = document.getElementById('main-view');
const gameView = document.getElementById('game-view');
const problemContainer = document.getElementById('problem-container');
const tierRange = document.getElementById('tier-range');
const tierLabel = document.getElementById('tier-label');

let problemList = [];
let currentIndex = 0;
let correctTierNum = null; // 서버에서 받은 티어 정답 숫자 저장


const tierStringToNumber = (tierStr) => {
    if (!tierStr) return null;
  
    const romanMap = {
      'I': 1,
      'II': 2,
      'III': 3,
      'IV': 4,
      'V': 5
    };
  
    const [categoryRaw, roman] = tierStr.split(' '); // e.g. "Gold IV" → ["Gold", "IV"]
    const category = categoryRaw.toLowerCase();      // "Gold" → "gold"
    const romanValue = romanMap[roman];
  
    const categoryOffset = {
      bronze: 0,
      silver: 5,
      gold: 10,
      platinum: 15,
      diamond: 20,
      ruby: 25
    };
  
    return categoryOffset[category] + (6 - romanValue); // 예: gold 4 → 10 + 2 = 12
  };

  const tierMap = [
    'bronze 5', 'bronze 4', 'bronze 3', 'bronze 2', 'bronze 1',
    'silver 5', 'silver 4', 'silver 3', 'silver 2', 'silver 1',
    'gold 5', 'gold 4', 'gold 3', 'gold 2', 'gold 1',
    'platinum 5', 'platinum 4', 'platinum 3', 'platinum 2', 'platinum 1',
    'diamond 5', 'diamond 4', 'diamond 3', 'diamond 2', 'diamond 1',
    'ruby 5', 'ruby 4', 'ruby 3', 'ruby 2', 'ruby 1'
  ];
  
  // 초기 표시용
  tierLabel.textContent = tierMap[tierRange.value - 1];
  
  tierRange.addEventListener('input', () => {
    tierLabel.textContent = tierMap[tierRange.value - 1];
  });

  async function loadProblem(index) {
    const problemId = problemList[index];
    const res = await fetch(`http://localhost:3000/problem/${problemId}`);
    const data = await res.json();
  
    correctTierNum = tierStringToNumber(data.tier);
    tierRange.disabled = false;
    tierRange.value = 15;
    tierLabel.textContent = tierMap[14];
    resultBox.innerHTML = '';
  
    problemContainer.innerHTML = `
      <h2>문제 ${data.id} - ${data.title}</h2>
      <div class="section">${data.description}</div>
  
      <h3>입력</h3>
      <div class="section">${data.input}</div>
  
      <h3>출력</h3>
      <div class="section">${data.output}</div>
    `;
  
    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  }

startBtn.addEventListener('click', async () => {
  mainView.classList.remove('active');
  setTimeout(() => gameView.classList.add('active'), 100);

  try {
    const res = await fetch(`http://localhost:3000/problem/${PROBLEM_ID}`);
    const data = await res.json();

    problemContainer.innerHTML = `
      <h2>문제 ${data.id} - ${data.title}</h2>
      <div class="section">${data.description}</div>

      <h3>입력</h3>
      <div class="section">${data.input}</div>

      <h3>출력</h3>
      <div class="section">${data.output}</div>

      <div class="answer hidden" id="answer-box">
        <h3>정답 티어: <span id="correct-tier">${data.tier || '알 수 없음'}</span></h3>
      </div>
    `;

    // 수식 렌더링
    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  } catch (err) {
    console.error(err);
    problemContainer.innerHTML = '<p>문제를 불러오는 데 실패했습니다.</p>';
  }
});


tierRange.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  tierLabel.textContent = `${val} (${tierMap[val - 1]})`;
});

const checkBtn = document.getElementById('check-btn');
const resultBox = document.getElementById('result');

startBtn.addEventListener('click', async () => {
  mainView.classList.remove('active');
  setTimeout(() => gameView.classList.add('active'), 100);

  try {
    const res = await fetch(`http://localhost:3000/problem/${PROBLEM_ID}`);
    const data = await res.json();

    // 정답 숫자 저장
    correctTierNum = tierStringToNumber(data.tier);

    problemContainer.innerHTML = `
      <h2>문제 ${data.id} - ${data.title}</h2>
      <div class="section">${data.description}</div>

      <h3>입력</h3>
      <div class="section">${data.input}</div>

      <h3>출력</h3>
      <div class="section">${data.output}</div>
    `;

    // 수식 렌더링
    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  } catch (err) {
    console.error(err);
    problemContainer.innerHTML = '<p>문제를 불러오는 데 실패했습니다.</p>';
  }
});

checkBtn.addEventListener('click', () => {
    const userTierNum = parseInt(tierRange.value, 10);
  
    if (correctTierNum === null) {
      resultBox.innerHTML = '정답 티어를 불러오지 못했습니다.';
      return;
    }
  
    // 바 비활성화
    tierRange.disabled = true;
  
    const isCorrect = userTierNum === correctTierNum;
    const correctTierLabel = tierMap[correctTierNum - 1];
    const userTierLabel = tierMap[userTierNum - 1];
  
    resultBox.innerHTML = `
      <p>${isCorrect ? '✅ 정답입니다!' : '❌ 틀렸습니다.'}</p>
      <p>내가 고른 티어: <strong>${userTierLabel}</strong></p>
      <p>정답 티어: <strong>${correctTierLabel}</strong></p>
    `;
  });

  startBtn.addEventListener('click', async () => {
    mainView.classList.remove('active');
    setTimeout(() => gameView.classList.add('active'), 100);
  
    const res = await fetch('http://localhost:3000/random-problems');
    const data = await res.json();
    problemList = data.problemIds;
    currentIndex = 0;
  
    await loadProblem(currentIndex);
    nextBtn.classList.remove('hidden');
  });

  nextBtn.addEventListener('click', async () => {
    if (currentIndex < problemList.length - 1) {
      currentIndex += 1;
      await loadProblem(currentIndex);
    } else {
      resultBox.innerHTML = '<p>문제를 모두 풀었습니다 🎉</p>';
      nextBtn.disabled = true;
    }
  });