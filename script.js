let currentRound = 1, scoreA = 0, scoreB = 0;
let stage = 1, timerId, basePassA, basePassB;
let repeatA = '', repeatB = '';
let nameA = '', nameB = '';

function updateLabels() {
  nameA = document.getElementById('nameA').value || 'Fighter A';
  nameB = document.getElementById('nameB').value || 'Fighter B';
  document.getElementById('labelA').textContent = nameA;
  document.getElementById('labelB').textContent = nameB;
  document.getElementById('scoreNameA').textContent = nameA;
  document.getElementById('scoreNameB').textContent = nameB;
}

function updateScoreboard() {
  document.getElementById('roundNum').textContent = currentRound;
  document.getElementById('scoreA').textContent = scoreA;
  document.getElementById('scoreB').textContent = scoreB;
}

function handleRound() {
  updateLabels();
  const result = document.getElementById('result');
  const actionBtn = document.getElementById('actionButton');

  if (stage === 1) {
    basePassA = document.getElementById('passwordA').value;
    basePassB = document.getElementById('passwordB').value;

    if (!basePassA || !basePassB) {
      result.textContent = "⛔ Both fighters must enter a password!";
      return;
    }

    document.getElementById('passwordA').value = '';
    document.getElementById('passwordB').value = '';
    result.textContent = `⏱ ${nameA}'s turn to repeat (10 seconds)`;
    stage = 2;
    actionBtn.disabled = true;
    startTimer('A');

  } else if (stage === 2.5) {
    repeatA = document.getElementById('passwordA').value;
    document.getElementById('passwordA').value = '';
    document.getElementById('passwordB').value = '';
    stage = 3;
    result.textContent = `⏱ ${nameB}'s turn to repeat (10 seconds)`;
    startTimer('B');

  } else if (stage === 3.5) {
    repeatB = document.getElementById('passwordB').value;
    stage = 1;
    evaluateRound();
  }
}

function startTimer(player) {
  let sec = 10;
  const timerEl = document.getElementById('timer');
  const inputId = player === 'A' ? 'passwordA' : 'passwordB';
  const result = document.getElementById('result');
  const actionBtn = document.getElementById('actionButton');

  timerEl.textContent = `Time: ${sec}`;

  const countdown = setInterval(() => {
    sec--;
    timerEl.textContent = `Time: ${sec}`;
    if (sec <= 0) {
      clearInterval(countdown);
      timerEl.textContent = "⏰ Time’s up!";
      if (player === 'A') {
        repeatA = document.getElementById(inputId).value;
        stage = 2.5;
        actionBtn.disabled = false;
        result.textContent = `✅ ${nameA} submitted. Click to proceed to ${nameB}'s turn.`;
        actionBtn.textContent = "Next";
      } else if (player === 'B') {
        repeatB = document.getElementById(inputId).value;
        stage = 3.5;
        actionBtn.disabled = false;
        result.textContent = `✅ ${nameB} submitted. Click to evaluate the round.`;
        actionBtn.textContent = "Evaluate";
      }
    }
  }, 1000);
}

function evaluateRound() {
  const result = document.getElementById('result');
  const actionBtn = document.getElementById('actionButton');
  document.getElementById('timer').textContent = '';
  actionBtn.textContent = "Submit Round";
  actionBtn.disabled = false;

  let pointsA = 0, pointsB = 0;
  let explanation = "";

  const correctA = repeatA === basePassA;
  const correctB = repeatB === basePassB;

  if (correctA && !correctB) {
    pointsA = 1;
    explanation = `${nameA} correctly repeated the password. ${nameB} did not.`;
  } else if (!correctA && correctB) {
    pointsB = 1;
    explanation = `${nameB} correctly repeated the password. ${nameA} did not.`;
  } else if (correctA && correctB) {
    const scoreA2 = zxcvbn(basePassA).score;
    const scoreB2 = zxcvbn(basePassB).score;
    if (scoreA2 > scoreB2) {
      pointsA = 2;
      explanation = `Both repeated correctly. ${nameA}'s password was stronger (Score: ${scoreA2} vs ${scoreB2}).`;
    } else if (scoreB2 > scoreA2) {
      pointsB = 2;
      explanation = `Both repeated correctly. ${nameB}'s password was stronger (Score: ${scoreB2} vs ${scoreA2}).`;
    } else {
      pointsA = pointsB = 1;
      explanation = `Both repeated correctly and passwords were equally strong (Score: ${scoreA2}).`;
    }
  } else {
    explanation = `Neither fighter repeated the password correctly. No points.`;
  }

  let winnerEl = null;
  if (pointsA > pointsB) winnerEl = document.getElementById('labelA');
  else if (pointsB > pointsA) winnerEl = document.getElementById('labelB');

  if (winnerEl) {
    winnerEl.classList.add('highlight');
    setTimeout(() => winnerEl.classList.remove('highlight'), 1000);
  }

  const scoreMsg = (pointsA || pointsB)
    ? `🎯 ${pointsA > pointsB ? nameA : pointsB > pointsA ? nameB : 'Both'} earn${pointsA === pointsB ? '' : 's'} point${Math.max(pointsA, pointsB) > 1 ? 's' : ''}!`
    : "No points this round.";

  result.innerHTML = `${scoreMsg}<br><small>${explanation}</small>`;

  scoreA += pointsA;
  scoreB += pointsB;
  currentRound++;
  updateScoreboard();

  if (currentRound > 10) showFinal();
}

function showFinal() {
  const result = document.getElementById('result');
  document.getElementById('actionButton').disabled = true;

  let finalMsg = '';
  if (scoreA > scoreB) {
    finalMsg = `🏆 ${nameA} wins the match!`;
    document.getElementById('labelA').classList.add('final');
  } else if (scoreB > scoreA) {
    finalMsg = `🏆 ${nameB} wins the match!`;
    document.getElementById('labelB').classList.add('final');
  } else {
    finalMsg = "🤝 It's a tie!";
  }

  result.innerHTML = `${finalMsg}<br>Final Score: ${nameA}: ${scoreA} | ${nameB}: ${scoreB}`;
  result.classList.add('final');
}
