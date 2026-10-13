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
  audio.preload = "auto";

  let playbackTimer = null;
  let playbackRequest = 0;
  let answered = false;

  function stopMusic() {
    playbackRequest++;
    clearTimeout(playbackTimer);
    playbackTimer = null;

    audio.pause();

    try {
      audio.currentTime = 0;
    } catch (error) {
      console.warn("재생 위치 초기화 실패:", error);
    }

    const playButton = document.getElementById("songQuizPlay");
    if (playButton) {
      playButton.textContent = "▶";
      playButton.disabled = false;
    }
  }

  function playIntro(song) {
    stopMusic();

    const request = playbackRequest;
    const playButton = document.getElementById("songQuizPlay");

    if (!playButton) return;

    let message = document.getElementById("songQuizAudioError");

    if (!message) {
      message = document.createElement("p");
      message.id = "songQuizAudioError";
      message.style.color = "#d94b65";
      message.style.fontSize = "13px";
      message.style.margin = "8px 0";
      playButton.insertAdjacentElement("afterend", message);
    }

    message.textContent = "";
    playButton.textContent = "読み込み中…";
    playButton.disabled = true;

    if (audio.getAttribute("src") !== song.audio) {
      audio.src = song.audio;
    }

    let promise;

    try {
      promise = audio.play();
    } catch (error) {
      promise = Promise.reject(error);
    }

    Promise.resolve(promise).then(() => {
      if (request !== playbackRequest || answered) return;

      playButton.textContent = "Ⅱ";
      playButton.disabled = false;

      playbackTimer = setTimeout(() => {
        if (request === playbackRequest) stopMusic();
      }, 5000);

    }).catch(error => {
      if (request !== playbackRequest || answered) return;

      console.warn("음악 재생 실패:", song.title, error);

      playButton.textContent = "▶";
      playButton.disabled = false;
      message.textContent = "再生できませんでした。もう一度お試しください。";
    });
  }

  function showQuestion() {
    stopMusic();
    answered = false;

    const song = questions[questionIndex];

    // 문제별 음악 파일을 준비하되 load()는 호출하지 않음
    audio.src = song.audio;

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
