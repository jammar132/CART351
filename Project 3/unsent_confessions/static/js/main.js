let selectedColor = "#000000";
let selectedText = "white"; // "black" or "white" (will auto-update based on card color)

function qs(id){ return document.getElementById(id); }

function clampText(s){
  return (s ?? "").toString();
}

function normalizeHex(h){
  if (!h) return "#000000";
  h = h.trim().toLowerCase();
  if (!h.startsWith("#")) h = "#" + h;
  // expand short hex
  if (h.length === 4){
    h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  return h;
}

function isPureBlack(hex){
  return normalizeHex(hex) === "#000000";
}
function isPureWhite(hex){
  return normalizeHex(hex) === "#ffffff";
}

function setTextSelected(btn){
  document.querySelectorAll(".textSwatch").forEach(b => b.classList.remove("isSelected"));
  btn.classList.add("isSelected");
}

function setTextPaletteDisabled(disabled){
  const wrap = qs("textPalette");
  if (!wrap) return;
  wrap.classList.toggle("isDisabled", !!disabled);
}

function applyTextToComposer(){
  const card = qs("composerCard");
  if (!card) return;

  const textHex = (selectedText === "white") ? "#ffffff" : "#111111";
  card.style.setProperty("--textColor", textHex);

  // Placeholder rules:
  // - if card background is black -> lighter gray placeholder
  // - otherwise placeholder matches text choice (black-ish or white-ish)
  if (isPureBlack(selectedColor)){
    card.style.setProperty("--placeholderColor", "rgba(255,255,255,0.5)");
  } else {
    if (selectedText === "white"){
      card.style.setProperty("--placeholderColor", "rgba(255,255,255,0.55)");
    } else {
      card.style.setProperty("--placeholderColor", "rgba(0,0,0,0.35)");
    }
  }
}

function setComposerColor(color){
  selectedColor = normalizeHex(color);

  const card = qs("composerCard");
  card.style.setProperty("--cardColor", selectedColor);

  // HARD RULES:
  // - black card => force white text, disable picker
  // - white card => force black text, disable picker
  // - others => allow user pick
  if (isPureBlack(selectedColor)){
    selectedText = "white";
    setTextPaletteDisabled(true);
    // visually select the right text swatch if it exists
    const btn = document.querySelector('.textSwatch[data-text="white"]');
    if (btn) setTextSelected(btn);
  } else if (isPureWhite(selectedColor)){
    selectedText = "black";
    setTextPaletteDisabled(true);
    const btn = document.querySelector('.textSwatch[data-text="black"]');
    if (btn) setTextSelected(btn);
  } else {
    setTextPaletteDisabled(false);
    // keep whatever the user selected (default black unless they clicked white)
  }

  applyTextToComposer();
}

function setSwatchSelected(btn){
  document.querySelectorAll(".swatch").forEach(b => b.classList.remove("isSelected"));
  btn.classList.add("isSelected");
}

function buildPostCard(p){
  const card = document.createElement("div");
  card.className = "postCard";
  card.style.setProperty("--cardColor", p.color || "#ffffff");

  const top = document.createElement("div");
  top.className = "postTop";

  const abc = document.createElement("div");
  abc.className = "abcBox";
  abc.textContent = "ABC";

  const to = document.createElement("div");
  to.className = "postTo";
  to.innerHTML = `<span class="toLabel">To:</span> <span class="toName">${escapeHtml(p.to || " ")}</span>`;

  const mail = document.createElement("div");
  mail.className = "mailIcon";

  top.appendChild(abc);
  top.appendChild(to);
  top.appendChild(mail);

  const msg = document.createElement("div");
  msg.className = "postMsg";
  msg.textContent = clampText(p.message);

  // apply stored text color on wall
  const t = (p.text_color === "white") ? "#ffffff" : "#111111";
  msg.style.color = t;

  const bottom = document.createElement("div");
  bottom.className = "postBottom";

  const tag = document.createElement("div");
  tag.className = "tagPill";
  tag.textContent = p.emotion || "other";

  bottom.appendChild(tag);

  // ONLY show delete if server says can_delete === true
  if (p.can_delete) {
    const del = document.createElement("button");
    del.className = "deleteBtn";
    del.type = "button";
    del.textContent = "×";
    del.addEventListener("click", async () => {
      await fetch(`/api/posts/${p.id}`, { method: "DELETE" });
      await loadPosts();
    });
    bottom.appendChild(del);
  }

  card.appendChild(top);
  card.appendChild(msg);
  card.appendChild(bottom);
  return card;
}

function escapeHtml(str){
  return (str ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}

async function loadPosts(){
  const q = qs("searchInput").value.trim();
  const emotion = qs("emotionFilter").value;

  const url = new URL("/api/posts", window.location.origin);
  if (q) url.searchParams.set("q", q);
  if (emotion && emotion !== "all") url.searchParams.set("emotion", emotion);

  const res = await fetch(url.toString());
  const data = await res.json();

  const grid = qs("postsGrid");
  grid.innerHTML = "";

  if (!data.length) {
    qs("emptyState").style.display = "block";
  } else {
    qs("emptyState").style.display = "none";
    data.forEach(p => grid.appendChild(buildPostCard(p)));
  }
}

async function createPost(){
  const payload = {
    to: qs("toInput").value.trim(),
    message: qs("msgInput").value.trim(),
    emotion: qs("emotionSelect").value,
    color: selectedColor,
    text_color: selectedText
  };

  if (!payload.message) return;

  await fetch("/api/posts", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });

  // clear message 
  qs("msgInput").value = "";
  await loadPosts();
}

function setupPalette(){
  const swatches = document.querySelectorAll(".swatch");
  if (!swatches.length) return;

  // default select first swatch
  const first = swatches[0];
  selectedColor = normalizeHex(first.dataset.color);
  setSwatchSelected(first);
  setComposerColor(selectedColor);

  swatches.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedColor = normalizeHex(btn.dataset.color);
      setSwatchSelected(btn);
      setComposerColor(selectedColor);
    });
  });
}

function setupTextPalette(){
  const buttons = document.querySelectorAll(".textSwatch");
  if (!buttons.length) return;

  // pick the button that matches current selectedText 
  let btn = document.querySelector(`.textSwatch[data-text="${selectedText}"]`);

  // if not found, default to black (ONLY if the card isn’t forcing something)
  if (!btn) {
    selectedText = "black";
    btn = document.querySelector('.textSwatch[data-text="black"]') || buttons[0];
  }

  if (btn) setTextSelected(btn);

  buttons.forEach(b => {
    b.addEventListener("click", () => {
      const wrap = qs("textPalette");
      if (wrap && wrap.classList.contains("isDisabled")) return;

      selectedText = (b.dataset.text === "white") ? "white" : "black";
      setTextSelected(b);
      applyTextToComposer();
    });
  });

  setComposerColor(selectedColor);
}

function setupUI(){
  qs("sendBtn").addEventListener("click", createPost);

  qs("clearBtn").addEventListener("click", () => {
    qs("toInput").value = "";
    qs("msgInput").value = "";
  });

  qs("applyFilter").addEventListener("click", (e) => {
    e.preventDefault();
    loadPosts();
  });

  qs("resetFilter").addEventListener("click", (e) => {
    e.preventDefault();
    qs("searchInput").value = "";
    qs("emotionFilter").value = "all";
    loadPosts();
  });

  // Enter-to-filter in search
  qs("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadPosts();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupPalette();
  setupTextPalette();
  setupUI();
  loadPosts();
});