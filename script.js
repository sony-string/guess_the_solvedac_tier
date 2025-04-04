const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const checkBtn = document.getElementById('check-btn');
const restartBtn = document.getElementById('restart-btn');
const resultBox = document.getElementById('result');
const finalResultBox = document.getElementById('final-result-box');
const mainView = document.getElementById('main-view');
const gameView = document.getElementById('game-view');
const resultView = document.getElementById('result-view');
const problemContainer = document.getElementById('problem-container');
const tierRange = document.getElementById('tier-range');
const tierLabel = document.getElementById('tier-label');
const tierButtons = document.querySelectorAll('.tier-btn');
const rangeLabel = document.getElementById('range-label');
const countButtons = document.querySelectorAll('.count-btn');


const serverhost = 'http://34.82.215.66:80';
// const serverhost = 'http://localhost:3000';
let problemList = [];
let currentIndex = 0;
let selectedCount = 5; // 기본값
let correctTierNum = null; // 서버에서 받은 티어 정답 숫자 저장
let correctTierLabel = null;
let gameResults = [];
let currentProblemTitle = '';
let selectedMin = 0;
let selectedMax = 5;
let clickCount = 0;


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

  const tierKeys = ['b', 's', 'g', 'p', 'd', 'r'];

  const tierRanges = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby'];
  const tierClassMap = ['tier-bronze', 'tier-silver', 'tier-gold', 'tier-platinum', 'tier-diamond', 'tier-ruby'];

  const getTierRange = (tierLabel) => {
    return tierLabel.split(' ')[0].toLowerCase(); // "Gold IV" → "gold"
  };

countButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedCount = parseInt(btn.dataset.count);
        
        countButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});
  
tierRange.addEventListener('input', (e) => {
  const value = parseInt(e.target.value);
  const tierName = capitalize(tierRanges[tierRange.value]);
  const className = tierClassMap[value];

  // 텍스트 업데이트
  tierLabel.textContent = tierName;

  // 기존 클래스 제거 후 새 클래스 추가
  tierRange.classList.remove(...tierClassMap);
  tierRange.classList.add(className);
});

async function loadProblem(index) {
    const problemId = problemList[index];
    const res = await fetch(serverhost + `/problem/${problemId}`);
    const data = await res.json();

    correctTierLabel = data.tier; // e.g., "Gold IV"
    currentProblemTitle = data.title;

    tierRange.max = tierRanges.length - 1;
    tierRange.value = 2; // 기본 골드
    tierRange.classList.remove(...tierClassMap);
    tierRange.classList.add(tierClassMap[2]);
  
    correctTierNum = tierStringToNumber(data.tier);
    tierRange.disabled = false;    
    tierLabel.textContent = 'Gold';
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

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

function updateButtonStyles() {
    tierButtons.forEach((btn, idx) => {
      if (idx >= selectedMin && idx <= selectedMax) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
    
    if (clickCount === 1) {
        rangeLabel.textContent = `${tierRanges[selectedMin]} ~ `;
    } else {
        rangeLabel.textContent = `${tierRanges[selectedMin]} ~ ${tierRanges[selectedMax]}`;
    }
}
  
tierButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);

        if (clickCount === 0) {
            selectedMin = idx;
            selectedMax = idx;
            clickCount = 1;
        } else {
            selectedMax = idx;
            if (selectedMin > selectedMax) {
                [selectedMin, selectedMax] = [selectedMax, selectedMin];
            }
            clickCount = 0;
        }

        updateButtonStyles();
    });
});

updateButtonStyles();

startBtn.addEventListener('click', async () => { 
    if (clickCount == 1) {
        alert('티어 범위를 마저 선택해주세요!');
        return;
    }
    mainView.classList.remove('active');
    setTimeout(() => gameView.classList.add('active'), 100);

    const res = await fetch(serverhost + `/random-problems?min=${tierKeys[selectedMin]}&max=${tierKeys[selectedMax]}&count=${selectedCount}`);
    const data = await res.json();
    problemList = data.problemIds;
    currentIndex = 0;

    await loadProblem(currentIndex);
});
  
checkBtn.addEventListener('click', () => {
    const userTierIndex = parseInt(tierRange.value, 10);
    const userTier = tierRanges[userTierIndex];
  
    const correctTier = getTierRange(correctTierLabel);
    const isCorrect = capitalize(userTier) === capitalize(correctTier);    
  
    resultBox.innerHTML = `
      <p>${isCorrect ? '✅ 정답입니다!' : '❌ 틀렸습니다.'}</p>
      <p>내가 고른 티어: <strong>${capitalize(userTier)}</strong></p>
      <p>정답 티어: <strong>${capitalize(correctTierLabel)}</strong></p>
    `;
  
    // 기록 저장
    gameResults.push({
      id: problemList[currentIndex],
      title: currentProblemTitle,
      actual: capitalize(correctTierLabel),
      chosen: capitalize(userTier),
      correct: isCorrect
    });
  
    // 버튼 토글
    checkBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');
    tierRange.disabled = true;
});

nextBtn.addEventListener('click', async () => {
    currentIndex += 1;    
    if (currentIndex < problemList.length) {
        await loadProblem(currentIndex);

        // 버튼 상태 초기화
        checkBtn.classList.remove('hidden'); // ← 정답 버튼 다시 보이기
        nextBtn.classList.add('hidden');     // ← 다음 버튼 숨기기
    } else {
        showFinalResults();
    }
});

function showFinalResults() {
    const correctCount = gameResults.filter((r) => r.correct).length;
    finalResultBox.innerHTML = `<h2>결과 요약 (${correctCount} / ${gameResults.length} 정답)</h2>`;
  
    const grid = document.createElement('div');
    grid.classList.add('result-grid');
  
    gameResults.forEach((r) => {
      const card = document.createElement('div');
      card.classList.add('result-card');
      card.classList.add(r.correct ? 'correct' : 'incorrect');
      card.innerHTML = `
        <p><strong>#${r.id}</strong> - ${r.title}</p>
        <p>정답 티어: <span class="tier">${r.actual}</span></p>
        <p>선택한 티어: <span class="tier">${r.chosen}</span></p>
        <p class="result-tag">${r.correct ? '✅ 정답' : '❌ 오답'}</p>
      `;
      grid.appendChild(card);
    });
  
    finalResultBox.appendChild(grid);
    finalResultBox.appendChild(restartBtn); // fancy-btn
    gameView.classList.remove('active');
    resultView.classList.add('active');
    window.scrollTo(0, 0);
  }


restartBtn.addEventListener('click', () => {
    location.reload(); // 🔄 전체 페이지 새로고침
});