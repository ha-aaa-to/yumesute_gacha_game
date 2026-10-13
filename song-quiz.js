/* ===== SONG QUIZ ===== */
(() => {
  const body = document.getElementById("songQuizBody");

  if (!body || !Array.isArray(SONG_QUIZ_DATA)) return;

  const TOTAL = 10;
  const REQUIRED = 5;
  const REWARD = 1000;

  let questions = [];
  let questionIndex = 0;
  let correctCount = 0;

  function showStart() {
    body.innerHTML = `
      <div class="song-quiz-start">
        <p>イントロを5秒聴いて曲名を当てよう！</p>
        <p>10問中5問正解でクリア！</p>
        <button id="songQuizStartButton">START</button>
      </div>
    `;

    document.getElementById("songQuizStartButton")
      .addEventListener("click", startGame);
  }

  function startGame() {
    questions = [...SONG_QUIZ_DATA]
      .sort(() => Math.random() - 0.5)
      .slice(0, TOTAL);

    questionIndex = 0;
    correctCount = 0;

    showQuestion();
  }

  const audio = new Audio();
  let playbackTimer = null;
  let answered = false;

  function stopMusic() {
    clearTimeout(playbackTimer);
    playbackTimer = null;
    audio.pause();
    audio.currentTime = 0;

    const playButton = document.getElementById("songQuizPlay");
    if (playButton) playButton.textContent = "▶";
  }

  function playIntro(song) {
    stopMusic();

    const playButton = document.getElementById("songQuizPlay");

    audio.play().then(() => {
      if (playButton) playButton.textContent = "Ⅱ";

      playbackTimer = setTimeout(() => {
        stopMusic();
      }, 5000);
    }).catch(error => {
      stopMusic();
      console.warn("음악 재생 실패:", error);
    });
  }

  function showQuestion() {
    stopMusic();
    answered = false;

    const song = questions[questionIndex];

    // 모바일 재생을 위해 문제 표시 시 음악 파일 준비
    audio.src = song.audio;
    audio.load();

    const wrongAnswers = [...SONG_QUIZ_DATA]
      .filter(item => item.title !== song.title)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [song, ...wrongAnswers]
      .sort(() => Math.random() - 0.5);

    body.innerHTML = `
      <div class="song-quiz-question">
        <h3>QUESTION ${questionIndex + 1} / ${TOTAL}</h3>
        <p>正解 ${correctCount} / ${TOTAL}</p>

        <button id="songQuizPlay" type="button">▶</button>
        <p>イントロを5秒再生</p>

        <div id="songQuizOptions"></div>
        <div id="songQuizReveal" hidden></div>
      </div>
    `;

    document.getElementById("songQuizPlay")
      .addEventListener("click", () => playIntro(song));

    const optionBox = document.getElementById("songQuizOptions");

    options.forEach(option => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "song-quiz-option";
      button.textContent = option.title;

      button.addEventListener("click", () => {
        if (answered) return;

        answered = true;
        stopMusic();

        const isCorrect = option.title === song.title;

        if (isCorrect) correctCount++;

        optionBox.querySelectorAll("button").forEach(item => {
          item.disabled = true;

          if (item.textContent === song.title) {
            item.classList.add("correct");
          } else if (item === button) {
            item.classList.add("wrong");
          }
        });

        const reveal = document.getElementById("songQuizReveal");
        reveal.hidden = false;

        const result = document.createElement("p");
        result.textContent = isCorrect ? "正解！" : "不正解";

        const cover = document.createElement("img");
        cover.src = song.cover;
        cover.alt = song.title;

        const title = document.createElement("strong");
        title.textContent = song.title;

        const playButton = document.getElementById("songQuizPlay");

        if (playButton) {
          playButton.replaceWith(cover);
          cover.id = "songQuizCover";
        }

        const introText = body.querySelector(
          ".song-quiz-question > p:last-of-type"
        );

        if (introText) {
          introText.replaceChildren(result, title);
          introText.style.display = "flex";
          introText.style.flexDirection = "column";
          introText.style.alignItems = "center";
          introText.style.gap = "8px";
        }

        reveal.replaceChildren();

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.id = "songQuizNext";
        nextButton.textContent =
          questionIndex + 1 === TOTAL ? "RESULT" : "NEXT";

        nextButton.addEventListener("click", () => {
          stopMusic();
          questionIndex++;

          if (questionIndex >= TOTAL) {
            showResult();
          } else {
            showQuestion();
          }
        });

        reveal.appendChild(nextButton);
      });

      optionBox.appendChild(button);
    });
  }

  function showResult() {
    stopMusic();

    const cleared = correctCount >= REQUIRED;

    if (cleared) {
      if (
        typeof gameSave !== "undefined" &&
        typeof saveGameData === "function"
      ) {
        gameSave.currency =
          Number(gameSave.currency || 0) + REWARD;

        saveGameData();

        const balance =
          document.getElementById("currencyBalance");

        if (balance) {
          balance.textContent =
            gameSave.currency.toLocaleString("ja-JP");
        }
      }
    }

    body.innerHTML = `
      <div class="song-quiz-result">
        <h3>${cleared ? "CLEAR!" : "GAME OVER"}</h3>
        <p>正解数：${correctCount} / ${TOTAL}</p>
        ${cleared ? `<div class="song-quiz-reward"><img src="assets/currency-source.png" alt="スター"><span>+1,000</span></div>` : ""}
        <button id="songQuizRestart" type="button">RESTART</button>
      </div>
    `;

    document.getElementById("songQuizRestart")
      .addEventListener("click", startGame);
  }

  showStart();
})();
