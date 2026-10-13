/* DUGONG SONG SORT */
(() => {
  const select = document.getElementById("dugongSongSort");
  const list = document.querySelector(
    "#dugongSongList .dugong-song-list"
  );

  if (!select || !list) return;

  function sortSongs() {
    const buttons = [
      ...list.querySelectorAll(".dugong-song-item")
    ];

    const mode = select.value;

    buttons.sort((a, b) => {
      const numberA = Number(a.dataset.songNumber);
      const numberB = Number(b.dataset.songNumber);
      const levelA = Number(a.dataset.songLevel);
      const levelB = Number(b.dataset.songLevel);

      if (mode === "level-asc") {
        return levelA - levelB || numberA - numberB;
      }

      if (mode === "level-desc") {
        return levelB - levelA || numberA - numberB;
      }

      return numberA - numberB;
    });

    buttons.forEach(button => list.appendChild(button));
  }

  select.addEventListener("change", sortSongs);

  // 최초 진입: 곡 번호순
  sortSongs();
})();
