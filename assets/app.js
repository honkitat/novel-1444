/* 十四時四十四分 — reader behaviour, no dependencies */
(function () {
  const root = document.documentElement;
  const KEY = { theme: "ctf-theme", step: "ctf-step", pos: "ctf-pos" };

  // theme
  const savedTheme = localStorage.getItem(KEY.theme);
  if (savedTheme) root.dataset.theme = savedTheme;
  const tBtn = document.querySelector("[data-theme-toggle]");
  if (tBtn) tBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem(KEY.theme, next);
    tBtn.textContent = next === "dark" ? "光" : "暗";
  });

  // font size
  let step = parseFloat(localStorage.getItem(KEY.step) || "1");
  const apply = () => root.style.setProperty("--step", String(step));
  apply();
  document.querySelectorAll("[data-size]").forEach(b => b.addEventListener("click", () => {
    step = Math.min(1.35, Math.max(0.85, step + (b.dataset.size === "+" ? 0.075 : -0.075)));
    apply(); localStorage.setItem(KEY.step, String(step));
  }));

  // progress bar
  const bar = document.getElementById("progress");
  const onScroll = () => {
    if (!bar) return;
    const h = document.documentElement;
    const pct = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = pct + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // reading position (chapter pages only)
  const slug = document.body.dataset.slug;
  if (slug) {
    const posKey = KEY.pos + ":" + slug;
    const y = parseInt(localStorage.getItem(posKey) || "0", 10);
    if (y > 600 && !location.hash) setTimeout(() => scrollTo(0, y), 120);
    let t;
    addEventListener("scroll", () => {
      clearTimeout(t);
      t = setTimeout(() => localStorage.setItem(posKey, String(Math.round(scrollY))), 400);
    }, { passive: true });
  }

  // keyboard: j/k or arrows for next/prev
  const next = document.querySelector("[data-next]");
  const prev = document.querySelector("[data-prev]");
  addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.key === "ArrowRight" || e.key === "j") && next) location.href = next.href;
    if ((e.key === "ArrowLeft" || e.key === "k") && prev) location.href = prev.href;
  });

  // ---- view counter (aggregate only, no cookies, no identity) ----
  const pg = document.body.dataset.slug || "home";
  const key = "choi1444/" + pg;
  const seenKey = "ctf-seen-" + pg;
  const box = document.getElementById("hits");
  if (box) {
    const paint = (n) => {
      box.textContent = n ? "本章閱覽 " + n.toLocaleString("en-HK") + " 次" : "";
    };
    if (!sessionStorage.getItem(seenKey)) {
      sessionStorage.setItem(seenKey, "1");
      fetch("https://abacus.jasoncameron.dev/hit/" + key)
        .then((r) => r.json())
        .then((d) => paint(d.value))
        .catch(() => {});
    } else {
      fetch("https://abacus.jasoncameron.dev/get/" + key)
        .then((r) => r.json())
        .then((d) => paint(d.value))
        .catch(() => {});
    }
  }
})();
