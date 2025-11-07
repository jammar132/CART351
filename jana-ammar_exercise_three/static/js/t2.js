const words = {
  HEU: ["angry", "anxious", "stressed", "worried"],
  HEP: ["excited", "joyful", "motivated", "pleased"],
  LEU: ["sad", "tired", "bored", "meh"],
  LEP: ["calm", "content", "relaxed", "satisfied"]
};

const quad = document.getElementById('quad');
const wordBank = document.getElementById('wordBank');
const hint = document.getElementById('hint');
const journal = document.getElementById('journal');
const username = document.getElementById('username');
const saveBtn = document.getElementById('saveBtn');
const msg = document.getElementById('msg');

let selectedQuadrant = null;
let selectedEmotion = null;

quad.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-q]');
  if (!btn) return;
  [...quad.querySelectorAll('button')].forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  selectedQuadrant = btn.dataset.q;
  selectedEmotion = null;

  wordBank.innerHTML = '';
  (words[selectedQuadrant] || []).forEach(w => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip';
    c.textContent = w;
    c.onclick = () => {
      [...wordBank.children].forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      selectedEmotion = w;
    };
    wordBank.appendChild(c);
  });
  hint.textContent = "Choose a word:";
});

saveBtn.addEventListener('click', async () => {
  if (!selectedQuadrant || !selectedEmotion) {
    msg.style.display='block';
    msg.style.background='#fff3f3';
    msg.style.border='1px solid #f6b0b0';
    msg.textContent = "Pick a quadrant and a word first.";
    return;
  }
  const payload = {
    quadrant: selectedQuadrant,
    emotion: selectedEmotion,
    journal: journal.value.trim(),
    username: username.value.trim()
  };
  try {
    const r = await fetch("/postDataFetch", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!data.ok) throw new Error();
    msg.style.display='block';
    msg.style.background='#eefbf0';
    msg.style.border='1px solid #b7f0c2';
    msg.textContent = "Saved! (" + payload.emotion + " • " + payload.quadrant + ")";
  } catch {
    msg.style.display='block';
    msg.style.background='#fff3f3';
    msg.style.border='1px solid #f6b0b0';
    msg.textContent = "Could not save. Try again.";
  }
});