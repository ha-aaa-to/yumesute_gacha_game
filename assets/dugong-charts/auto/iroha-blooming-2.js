/* いろはうたBLOOMING 2 - AUTO CHART V2 */
(() => {
  const notes = [];
  let seed = 24066;

  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  let id = 1;
  let time = 3.5;

  while (time < 94.0) {
    const isLong = random() < 0.20;

    // 게임판 전체에 고르게 등장
    const x = 0.06 + random() * 0.88;

    notes.push({
      id: id++,
      time: Number(time.toFixed(3)),
      xNorm: x,
      kind: isLong ? "long" : "tap",
      sourceH: isLong ? 85 : 8
    });

    // 약 20% 확률로 동시 노트
    if (random() < 0.20) {
      const secondX = x < 0.5
        ? 0.65 + random() * 0.25
        : 0.10 + random() * 0.25;

      notes.push({
        id: id++,
        time: Number(time.toFixed(3)),
        xNorm: secondX,
        kind: "tap",
        sourceH: 8
      });
    }

    time += 0.22 + random() * 0.20;
  }

  window.DUGONG_AUTO_CHART_IROHA_2 = { notes };
})();
