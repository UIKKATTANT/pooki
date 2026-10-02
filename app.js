const card = document.querySelector('#card'),
      dialog = document.querySelector('#reaction');

// 🔐 SECRET CODE
const SECRET_CODE = '28062006';

// 🎯 Attempts tracker
let attemptsLeft = 4;

// 🎯 Funny images for wrong attempts (change file names as needed)
const WRONG_IMAGES = [
  { image: 'wrong1.jpg', text: 'Aiyo… adhu illa 🤭 Try again!' },
  { image: 'wrong2.jpg', text: 'Konjam yosinga… almost there 😏' },
  { image: 'wrong3.gif', text: 'Last chance ma… think! 🥹' }
];

// 🎯 Welcome image on correct password
const WELCOME_IMAGE = { image: 'welcome.jpg', text: 'Welcome, Vanising Queen ❤️' };

let index = 0,
    noCount = 0,
    accepted = false,
    selectedMonth = null,
    selectedDay = null,
    currentMonthOffset = 0;

// 🔐 PASSWORD PAGE
function passwordPage() {
  card.innerHTML = `
    <div class="progress"><i class="on"></i><i></i><i></i></div>
    <span class="step">PRIVATE ♡</span>
    <h2>This is only for you.</h2>
    <p class="hint">Enter the secret code 🤫</p>
    <input 
      type="text" 
      id="secret-input" 
      placeholder="Numbers only…" 
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="8"
      autocomplete="off"
      style="width:100%;padding:14px 16px;border:1px solid #eedde1;border-radius:12px;font:inherit;margin-bottom:14px;outline:none;letter-spacing:2px;text-align:center;"
    >
    <button class="primary full" id="unlock">Unlock ❤️</button>
    <p class="hint" id="error-msg" style="color:#b71935;min-height:20px;"></p>
    <p class="tiny">Attempts left: <span id="attempts">4</span> ♡</p>
  `;

  const input = document.querySelector('#secret-input');
  const btn = document.querySelector('#unlock');
  const err = document.querySelector('#error-msg');
  const attemptsEl = document.querySelector('#attempts');

  // 🔢 Allow ONLY digits
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '');
  });

  let locked = false; // prevents Enter double-fire

  const tryUnlock = () => {
    if (locked) return;
    if (!input.value.trim()) return;
    locked = true;

    // ✅ Correct
    if (input.value.trim() === SECRET_CODE) {
      showWelcome();
      return;
    }

    // ❌ Wrong
    attemptsLeft--;
    attemptsEl.textContent = attemptsLeft;

    // 🎯 Show funny popup for attempts 1, 2, 3
    if (attemptsLeft >= 1) {
      const wrongIndex = 4 - attemptsLeft - 1; // 0, 1, 2
      const wrong = WRONG_IMAGES[wrongIndex] || WRONG_IMAGES[0];
      showPopup(wrong.image, wrong.text, 'Try again 🤭', () => {
        locked = false;                    // 🔓 unlock after popup closes
        startCooldown(input, btn, err, tryUnlock);
      });
    } else {
      // 💀 4th wrong → final hint
      showFinalFail();
    }
  };

  btn.onclick = tryUnlock;
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryUnlock();
    }
  };
  input.focus();

  // Save so cooldown can rebind after lock
  input._tryUnlock = tryUnlock;
  btn._tryUnlock = tryUnlock;
}

// ⏳ 3-second cooldown between attempts
function startCooldown(input, btn, err, onReady) {
  let seconds = 3;
  input.value = '';
  input.disabled = true;
  btn.disabled = true;
  btn.style.opacity = '0.5';

  const tick = () => {
    err.textContent = `Wait ${seconds}s… ⏳`;
    err.style.color = '#a02b40';
    if (seconds === 0) {
      input.disabled = false;
      btn.disabled = false;
      btn.style.opacity = '1';
      err.textContent = '';
      input.focus();
      return;
    }
    seconds--;
    setTimeout(tick, 1000);
  };
  tick();
}
// 🎉 Welcome popup after correct password
function showWelcome() {
  showPopup(WELCOME_IMAGE.image, WELCOME_IMAGE.text, "Let's begin ❤️", () => {
    question();
  });
}

// 💀 Final fail — ask him for password
function showFinalFail() {
  card.innerHTML = `
    <span class="step">HMMMM… 🤔</span>
    <h2>We know a special day…</h2>
    <p class="hint">That day is your password. Think again 🥹</p>
    <div class="success">♡</div>
    <p>Three tries over… ask him for the code. He'll send it to you 😌❤️</p>
    <p class="tiny">No hurry. He's waiting anyway ♡</p>
  `;
}

// 🎯 Generic popup function
function showPopup(image, text, buttonText, onClose) {
  document.querySelector('#reaction-image').src = 'assets/' + image;
  document.querySelector('#reaction-copy').textContent = text;
  const action = document.querySelector('#reaction-action');
  action.textContent = buttonText;
  action.onclick = () => {
    dialog.close();
    if (onClose) onClose();
  };
  dialog.showModal();
}

// 🎯 Existing reaction function (for Yes/No)
function reaction(image, text, yes) {
  document.querySelector('#reaction-image').src = 'assets/' + image;
  document.querySelector('#reaction-copy').textContent = text;
  const action = document.querySelector('#reaction-action');
  action.textContent = yes
    ? (index === 2 ? 'A little surprise ❤️' : 'Next question ❤️')
    : 'Okay, okay 🤭';

  action.onclick = () => {
    dialog.close();
    if (yes) {
      index++;
      noCount = 0;
      accepted = false;
      index < 3 ? question() : videoPage();
    }
  };
  dialog.showModal();
}

function question() {
  const q = CONTENT.questions[index];

  card.innerHTML = `
    <div class="progress">${[0,1,2].map(n => `<i class="${n <= index ? 'on' : ''}"></i>`).join('')}</div>
    <span class="step">QUESTION 0${index + 1} / 03</span>
    <h2>${q.question}</h2>
    <p class="hint">Seri… sollu paapom 🤭</p>
    <div class="buttons">
      <button class="primary" id="yes">Yes, okay ❤️</button>
      <button class="secondary" id="no">No 🙃</button>
    </div>
    <p class="tiny">Just a silly little game between us ♡</p>
  `;

  document.querySelector('#yes').onclick = () => {
    accepted = true;
    reaction(q.yesImage, q.yes, true);
  };

  const no = document.querySelector('#no');

  no.onclick = () => {
    if (noCount >= 1) {
      escape(no);
      return;
    }
    reaction(q.noImages[noCount], q.no[noCount], false);
    noCount++;
  };

  no.onpointerenter = () => {
    if (noCount >= 1) escape(no);
  };

  no.onpointerdown = (e) => {
    if (noCount >= 1) {
      e.preventDefault();
      escape(no);
    }
  };

  dialog.onclose = () => {
    if (accepted) {
      accepted = false;
      card.innerHTML = `
        <span class="step">CAUGHT YOU 🤭</span>
        <h2>${q.yes}</h2>
        <button class="primary full" id="continue">Continue ❤️</button>
      `;
      document.querySelector('#continue').onclick = () => {
        index++;
        noCount = 0;
        index < 3 ? question() : videoPage();
      };
    }
  };
}

function escape(button) {
  const area = button.parentElement;
  button.classList.add('escape');
  const maxX = Math.max(0, area.clientWidth - button.offsetWidth),
        maxY = Math.max(0, area.clientHeight - button.offsetHeight);
  let x = Math.random() * maxX,
      y = 70 + Math.random() * Math.max(0, maxY - 70);
  button.style.left = x + 'px';
  button.style.top = Math.min(y, maxY) + 'px';
}

function videoPage() {
  dialog.onclose = null;
  card.classList.add('video-page');   // ← ADD THIS

  card.innerHTML = `
    <span class="step">ONE LITTLE SURPRISE</span>
    <h2>This one's for you.</h2>
    <div class="video-wrap">
      <video id="video" controls playsinline preload="metadata" src="${CONTENT.video}"></video>
    </div>
    <div id="video-status" class="video-status" hidden>The little surprise is on its way ♡</div>
    <p class="hint" id="video-hint">Sound on. Konjam tease panna poren 🤭</p>
    <button id="meet" class="primary full" disabled>One last question ❤️</button>
  `;

  const video = document.querySelector('#video'),
        meet = document.querySelector('#meet');

  video.onended = () => { meet.disabled = false; };
  video.onerror = () => {
    video.hidden = true;
    document.querySelector('#video-status').hidden = false;
    document.querySelector('#video-hint').textContent = 'Until then… can I ask you something?';
    meet.disabled = false;
  };
  meet.onclick = () => {
    card.classList.remove('video-page');   // ← REMOVE WHEN LEAVING
    datePage();
  };
}

// 📅 CLEAN DATE PAGE — month dropdown + calendar
function datePage() {
  const today = new Date();

  // Build list of next 12 months
  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    });
  }

  // Clamp offset
  if (currentMonthOffset >= months.length) currentMonthOffset = months.length - 1;
  const chosen = months[currentMonthOffset];

  card.innerHTML = `
    <span class="step">FROM CHATS TO REAL LIFE</span>
    <h2>Can we meet? 🥹</h2>
    <p class="hint">Pick a date that feels right ♡</p>

    <div class="date-picker">
      <select id="month-select" class="month-select">
        ${months.map((m, i) => `<option value="${i}" ${i === currentMonthOffset ? 'selected' : ''}>${m.label}</option>`).join('')}
      </select>
    </div>

    <div class="calendar-head">
      ${['S','M','T','W','T','F','S'].map(d => `<span>${d}</span>`).join('')}
    </div>
    <div class="calendar" id="calendar"></div>

    <div class="selected-date" id="selected-date">
      ${selectedDay ? `📅 ${new Date(chosen.year, chosen.month, selectedDay).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'No date selected yet'}
    </div>

    <button id="confirm" class="primary full" ${selectedDay ? '' : 'disabled'}>That's our date ❤️</button>
    <p class="hint">Take your time. Only if you'd like to ♡</p>
  `;

  const calendar = document.querySelector('#calendar');
  const confirmBtn = document.querySelector('#confirm');
  const selectedDateEl = document.querySelector('#selected-date');

  // 🔄 Month dropdown change
  document.querySelector('#month-select').onchange = (e) => {
    currentMonthOffset = parseInt(e.target.value, 10);
    selectedDay = null;
    datePage();
  };

  // 📅 Build calendar grid
  const start = new Date(chosen.year, chosen.month, 1).getDay();
  const days = new Date(chosen.year, chosen.month + 1, 0).getDate();

  // Empty cells before day 1
  for (let i = 0; i < start; i++) {
    const empty = document.createElement('span');
    empty.className = 'empty';
    calendar.append(empty);
  }

  // Day buttons
  for (let d = 1; d <= days; d++) {
    const b = document.createElement('button');
    b.textContent = d;
    b.className = 'day';

    const isPast = currentMonthOffset === 0 && d < today.getDate();
    if (isPast) {
      b.disabled = true;
      b.classList.add('past');
    }
    if (d === selectedDay) b.classList.add('selected');

    b.onclick = () => {
      if (isPast) return;
      selectedDay = d;
      // Update UI without full re-render
      calendar.querySelectorAll('.day').forEach(el => el.classList.remove('selected'));
      b.classList.add('selected');
      confirmBtn.disabled = false;
      selectedDateEl.textContent = `📅 ${new Date(chosen.year, chosen.month, selectedDay).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    };

    calendar.append(b);
  }

  // ✅ Confirm
  confirmBtn.onclick = () => {
    if (!selectedDay) return;
    const date = new Date(chosen.year, chosen.month, selectedDay).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    card.innerHTML = `
      <span class="step">A LITTLE SOMETHING TO LOOK FORWARD TO</span>
      <div class="success">♡</div>
      <h2>${date}</h2>
      <p>Chats-la irundhu… nerla paakalaam 🤭❤️</p>
      <p class="hint">Screenshot this and send it to me. I'll be smiling already.</p>
    `;
  };
}
// 🚀 START
passwordPage();
