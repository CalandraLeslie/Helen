/* Reading settings, menu and copy button. Settings are remembered on this device. */
(function () {
  var root = document.documentElement;
  var fonts = {
    lexend: "'Lexend', Verdana, Tahoma, sans-serif",
    atkinson: "'Atkinson Hyperlegible', Verdana, Tahoma, sans-serif",
    verdana: "Verdana, Tahoma, Geneva, sans-serif"
  };
  var wordSpace = { "0.02": "0.12em", "0.05": "0.24em", "0.1": "0.44em" };
  var defaults = { font: "lexend", size: "112.5", lh: "1.8", ls: "0.02", bg: "auto", ruler: "off" };
  var state = {}, k;
  for (k in defaults) state[k] = defaults[k];
  try {
    var saved = JSON.parse(localStorage.getItem("reading-settings") || "null");
    if (saved) for (k in saved) if (k in defaults) state[k] = String(saved[k]);
  } catch (e) {}

  var panel = document.getElementById("settings");
  var opener = document.getElementById("open-settings");
  var closer = document.getElementById("close-settings");
  var ruler = document.getElementById("ruler");

  function save() {
    try { localStorage.setItem("reading-settings", JSON.stringify(state)); } catch (e) {}
  }
  function moveRuler(y) {
    ruler.style.transform = "translateY(" + Math.round(y - ruler.offsetHeight / 2) + "px)";
  }
  function apply() {
    root.style.setProperty("--font-body", fonts[state.font] || fonts.lexend);
    root.style.setProperty("--scale", state.size + "%");
    root.style.setProperty("--lh", state.lh);
    root.style.setProperty("--ls", state.ls + "em");
    root.style.setProperty("--ws", wordSpace[state.ls] || "0.12em");
    if (state.bg === "auto") root.removeAttribute("data-comfort");
    else root.setAttribute("data-comfort", state.bg);
    var wasHidden = ruler.hidden;
    ruler.hidden = state.ruler !== "on";
    if (wasHidden && !ruler.hidden) moveRuler(window.innerHeight * 0.4);
    var radios = panel.querySelectorAll("input[type=radio]");
    for (var i = 0; i < radios.length; i++) radios[i].checked = state[radios[i].name] === radios[i].value;
  }

  panel.addEventListener("change", function (e) {
    if (e.target && e.target.name in defaults) {
      state[e.target.name] = e.target.value;
      apply();
      save();
    }
  });
  document.getElementById("reset-settings").addEventListener("click", function () {
    for (var key in defaults) state[key] = defaults[key];
    apply();
    try { localStorage.removeItem("reading-settings"); } catch (e) {}
  });

  function openPanel() {
    panel.hidden = false;
    opener.setAttribute("aria-expanded", "true");
    closer.focus();
  }
  function closePanel() {
    panel.hidden = true;
    opener.setAttribute("aria-expanded", "false");
    opener.focus();
  }
  opener.addEventListener("click", function () { if (panel.hidden) openPanel(); else closePanel(); });
  closer.addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) closePanel(); });

  document.addEventListener("pointermove", function (e) { if (!ruler.hidden) moveRuler(e.clientY); });
  document.addEventListener("touchmove", function (e) {
    if (!ruler.hidden && e.touches && e.touches[0]) moveRuler(e.touches[0].clientY);
  }, { passive: true });

  // Menu button (small screens)
  var menuBtn = document.getElementById("menu-btn");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.textContent = open ? "Close menu" : "Menu";
    });
  }

  // Copy email address
  var copyBtn = document.getElementById("copy-mail");
  if (copyBtn) {
    var copyStatus = document.getElementById("copy-status");
    copyBtn.addEventListener("click", function () {
      var mail = document.getElementById("mail");
      function fallback() {
        var range = document.createRange();
        range.selectNodeContents(mail);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        copyStatus.textContent = "The address is selected. Press copy on your device.";
      }
      try {
        navigator.clipboard.writeText(mail.textContent).then(function () {
          copyStatus.textContent = "Copied.";
        }, fallback);
      } catch (err) { fallback(); }
    });
  }

  apply();
})();
