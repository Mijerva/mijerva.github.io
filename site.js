(function () {
  // One entry per project; its text shows while one of its pictures is in
  // front. Add projects here.
  const PROJECTS = {
    softkvm: {
      // Points at the profile until the repository is public.
      name: "SoftKVM", state: "In development", repo: "https://github.com/Mijerva",
      headline: "Two PCs, one desk. One key switches.",
      about: "A software KVM for a Windows PC and a Linux PC on the same network. The screens you choose, the keyboard and the mouse move to the other PC when you press Ctrl+Alt+Space, and an emergency key always takes them back.",
      note: "Not released yet."
    },
    epson: {
      name: "EpsonReset", state: "Released", repo: "https://github.com/Mijerva/EpsonResetTool",
      headline: "Your printer says E-11. This makes it print again.",
      about: "For Epson ET-2870 series printers. It resets the waste ink counter over USB, after you have emptied or replaced the ink pads.",
      note: "Not made by or affiliated with Epson."
    },
    trcc: {
      name: "TRCC-LCD", state: "Beta", repo: "https://github.com/Mijerva/TRCC-LCD",
      headline: "Your own pictures on your cooler's screen.",
      about: "For the LCD on Thermalright AIO coolers, without the vendor software. A tray app keeps your picture or GIF on the screen using about 2 MB of memory. Tested on one 480 × 480 model so far.",
      note: "Not made by or affiliated with Thermalright. The comparison numbers in the pictures are illustrative, not measured yet."
    },
    deadlock: {
      name: "DeadLockMedic", state: "In development", repo: "https://github.com/Mijerva",
      headline: "A grade on every card, while you pick.",
      about: "An overlay for Deadlock on Windows. In Street Brawl it grades each offered card from S to F for your hero, from recorded matches. It also shows the skill order, imbue pick shares and your next build item. It reads screen pixels only, never game memory, and uploads nothing.",
      note: "Not released yet. Not made by or affiliated with Valve."
    },
    jobb: {
      name: "JobbHunter", state: "In development", repo: "https://github.com/Mijerva",
      headline: "Swedish job ads, checked against what you can do.",
      about: "A Windows app that collects real Swedish job ads and compares each requirement with the skills and experience you enter. It shows which requirements you meet, which need a check, and why. Your profile and the ads stay in a database on your PC.",
      note: "Not released yet. The match scores are still being checked by hand against real ads."
    }
  };
  // Pictures of the same project sit together, so the text only changes when
  // the project does. `pic` names a <template> in index.html; `desc` says
  // what the drawing shows, for screen readers.
  const SLIDES = [
    { p: "softkvm", pic: "pic-softkvm-desk", cap: "How it works",
      desc: "Three screens, a keyboard and a mouse are plugged into the Windows PC. Two of the screens show the Linux PC, which is connected over an encrypted network link." },
    { p: "softkvm", pic: "pic-softkvm-app", cap: "The app",
      desc: "The SoftKVM window: a Switch button with the shortcut Ctrl+Alt+Space, switches for free mouse crossing and the shared clipboard, the desk with three screens, and the settings of the selected screen: which PC it shows, its size and the apps that open on it." },
    { p: "epson", pic: "pic-epson-flow", cap: "How it works",
      desc: "The printer stops with error E-11, EpsonReset resets the counter over USB, and after a restart the printer prints again. Empty or replace the ink pads first." },
    { p: "epson", pic: "pic-epson-app", cap: "The app",
      desc: "The EpsonReset window shows the printer and a full waste ink counter, with the buttons Read printer status, Reset E-11 error and Check again." },
    { p: "trcc", pic: "pic-trcc-stats", cap: "Resources while it runs",
      desc: "Illustrative numbers, not measured yet: TRCC-LCD uses 2 MB of memory, 0.1 % CPU and 3 MB on disk, against 180 MB, 3 % and 120 MB for the vendor app." },
    { p: "trcc", pic: "pic-trcc-cooler", cap: "Your picture on the cooler",
      desc: "A cooler's 480 by 480 screen showing your own picture. Any picture or animated GIF is fitted and rotated for you." },
    { p: "deadlock", pic: "pic-deadlock-cards", cap: "Card grades",
      desc: "Sample numbers. Three offered cards, each with a tag below it: the first gets an S with a 57.8 % win rate and is highlighted, the second a D with 47.9 %, the third an F with 44.1 %." },
    { p: "deadlock", pic: "pic-deadlock-flow", cap: "What it reads",
      desc: "DeadLockMedic reads pixels from the Deadlock window and draws a separate click-through overlay. It never reads game memory, injects code, sends input or uploads anything. In the background it uses 0.016 % of one CPU core and 8.5 MB of memory." },
    { p: "jobb", pic: "pic-jobb-app", cap: "The app",
      desc: "The JobbHunter window: a list of jobs with match percentages, and the selected job's requirements, each marked as met or needing a check, with a confirmed match of 86 %." },
    { p: "jobb", pic: "pic-jobb-match", cap: "How a match is scored",
      desc: "An ad's requirements are compared with your qualifications. Two mandatory requirements are met and one preferred requirement is unknown, which gives a confirmed match of 86 %. A confirmed mandatory gap rules a job out whatever the percentage." }
  ];
  const INTERVAL = 5200;
  const $ = id => document.getElementById(id);
  const gallery = $("gallery");
  // `paused` is the visitor's choice; `hold` is a hover or keyboard focus.
  let i = 0, timer = null, shownProject = null, paused = false, hold = false;
  const els = SLIDES.map((sl, n) => {
    const a = document.createElement("a");
    a.className = "slide";
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", `${PROJECTS[sl.p].name}, ${sl.cap}: ${sl.desc} Opens on GitHub.`);
    a.appendChild($(sl.pic).content.cloneNode(true));
    const cap = document.createElement("div");
    cap.className = "caption";
    cap.innerHTML = "<span></span><span>Open on GitHub</span>";
    cap.firstChild.textContent = sl.cap;
    a.appendChild(cap);
    a.addEventListener("click", e => { if (n !== i) { e.preventDefault(); go(n); restart(); } });
    a.addEventListener("mouseenter", () => { if (n === i) { hold = true; restart(); } });
    a.addEventListener("mouseleave", () => { hold = false; restart(); });
    gallery.appendChild(a);
    return a;
  });

  function setText(p) {
    const t = $("text");
    const fill = () => {
      $("name").textContent = p.name;
      $("state").textContent = p.state;
      $("headline").textContent = p.headline;
      $("about-text").textContent = p.about;
      $("note").textContent = p.note;
      $("go").href = p.repo;
    };
    if (shownProject === null) { fill(); return; }
    t.classList.add("out");
    setTimeout(() => { fill(); t.classList.remove("out"); }, 280);
  }
  // Position by signed distance from the current slide, wrapped so the loop is endless.
  function layout() {
    const n = SLIDES.length, h = gallery.clientHeight;
    els.forEach((el, k) => {
      let d = k - i;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      const a = Math.abs(d);
      const scale = a === 0 ? 1 : a === 1 ? 0.55 : 0.32;
      const y = Math.sign(d) * (a === 0 ? 0 : a === 1 ? h * 0.47 : h * 0.68);
      el.style.setProperty("--y", y + "px");
      el.style.setProperty("--s", scale);
      el.style.setProperty("--o", a === 0 ? 1 : a === 1 ? 0.45 : a === 2 ? 0.15 : 0);
      el.style.setProperty("--z", 10 - a);
      el.classList.toggle("current", a === 0);
      el.classList.toggle("hidden", a > 2);
      el.tabIndex = a === 0 ? 0 : -1;
      el.href = PROJECTS[SLIDES[k].p].repo;
    });
  }
  // Only changes the visitor asked for are announced.
  function go(n, manual) {
    $("text").setAttribute("aria-live", manual ? "polite" : "off");
    i = (n + SLIDES.length) % SLIDES.length;
    const sl = SLIDES[i];
    layout();
    $("count").textContent = `${i + 1} / ${SLIDES.length}`;
    if (shownProject !== sl.p) { setText(PROJECTS[sl.p]); shownProject = sl.p; }
  }
  function restart() {
    clearInterval(timer);
    const still = paused || hold || matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!still) timer = setInterval(() => go(i + 1), INTERVAL);
  }
  // Keyboard focus follows the picture in front.
  const step = d => {
    const focused = gallery.contains(document.activeElement);
    go(i + d, true);
    if (focused) els[i].focus({ preventScroll: true });
    restart();
  };
  $("prev").addEventListener("click", () => step(-1));
  $("next").addEventListener("click", () => step(1));
  $("pause").addEventListener("click", () => {
    paused = !paused;
    $("pause").textContent = paused ? "Play" : "Pause";
    $("pause").setAttribute("aria-pressed", String(paused));
    restart();
  });
  // The wheel turns the gallery only where the page itself does not scroll,
  // and never takes Ctrl+wheel zoom.
  const narrow = matchMedia("(max-width: 820px)");
  let wheelLock = 0;
  gallery.addEventListener("wheel", e => {
    if (e.ctrlKey || narrow.matches) return;
    e.preventDefault();
    const now = Date.now();
    if (now - wheelLock < 600) return;
    wheelLock = now;
    step(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });
  gallery.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); step(1); }
    if (e.key === "ArrowUp") { e.preventDefault(); step(-1); }
  });
  gallery.addEventListener("focusin", () => { hold = true; restart(); });
  gallery.addEventListener("focusout", () => { hold = false; restart(); });
  addEventListener("resize", layout);
  // The button names the theme it switches to.
  const root = document.documentElement;
  const isDark = () => (root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
  const label = () => {
    $("theme").classList.toggle("dark", isDark());
    $("theme").setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
  };
  $("theme").addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    label();
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", label);
  label();
  go(0);
  restart();
})();
