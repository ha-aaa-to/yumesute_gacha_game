
/* MOBILE CREATOR POPUP OUTSIDE CLOSE */
(() => {
  const egg = document.getElementById("easterEgg");
  const reveal = document.getElementById("easterReveal");
  const trigger = document.getElementById("easterTrigger");

  if (!egg || !reveal || !trigger) return;

  reveal.addEventListener("click", event => {
    if (!window.matchMedia("(max-width: 600px)").matches) return;
    if (!egg.classList.contains("open")) return;

    if (event.target === reveal) {
      trigger.click();
    }
  });
})();
