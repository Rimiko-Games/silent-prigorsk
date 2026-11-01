/* Silent Prigorsk · Save system: autosave to the browser, Continue button, transfer code. No accounts. */
const SAVE_KEY = 'silent-prigorsk.save.v1';
let saveTimer = null;

function snapshot() {
  if (!S || !CS) return null;
  return { v: 1, at: Date.now(), cid: CS.id, S, ui: { tab: UI.tab, hintOff: UI.hintOff, inside: UI.inside, lampOff: UI.lampOff } };
}
function saveGame() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const snap = snapshot();
    if (!snap) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(snap)); } catch (e) {}
  }, 250);
}
function readSave() {
  try { const raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

function applySave(snap) {
  if (!snap || !CASES[snap.cid] || !snap.S) return false;
  CS = CASES[snap.cid];
  S = snap.S;
  S.dlg = null;
  Object.assign(UI, { tab: 'here', modal: null, inside: false, reveal: [], view: null, sel: [], phoneMsg: null, call: null, newClues: new Set(), title: false }, snap.ui || {});
  UI.modal = null;
  RQ.length = 0; NQ.length = 0; drawRadio(); drawNote();
  render(); window.scrollTo(0, 0);
  return true;
}

/* Transfer code: plain text you can send yourself and paste on another device */
const toCode = snap => 'SP1:' + btoa(unescape(encodeURIComponent(JSON.stringify(snap))));
function fromCode(code) {
  try {
    const c = code.trim().replace(/^SP1:/, '');
    return JSON.parse(decodeURIComponent(escape(atob(c))));
  } catch (e) { return null; }
}

function saveLabel(snap) {
  const c = CASES[snap.cid];
  const t = snap.S.t, d = Math.floor(t / 24) + 1, h = Math.floor(t % 24), m = Math.round((t % 1) * 60);
  return `Дело ${c ? c.no : ''} · день ${d} из ${c ? c.days : '?'} · ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/* Overlay used on the title screen (the game's own modals need an active case) */
function saveOverlay(html) {
  let el = document.getElementById('saveov');
  if (!el) { el = document.createElement('div'); el.id = 'saveov'; document.body.appendChild(el); }
  el.innerHTML = html ? `<div class="rv"><div class="rv-card night saveov">${html}</div></div>` : '';
}

function drawTitleSave() {
  const box = document.querySelector('#title .tin');
  if (!box) return;
  box.querySelectorAll('.savebtn').forEach(e => e.remove());
  const snap = readSave();
  const first = box.querySelector('[data-a=start]');
  if (snap && CASES[snap.cid] && !snap.S.over) {
    first.insertAdjacentHTML('beforebegin', `<button class="primary savebtn" data-a="continue">Продолжить<small>${saveLabel(snap)}</small></button>`);
    first.classList.remove('primary'); first.classList.add('ghost');
  } else { first.classList.add('primary'); first.classList.remove('ghost'); }
  box.insertAdjacentHTML('beforeend', `<button class="linkbtn savebtn" data-a="transfer">Перенести сохранение на другое устройство</button>`);
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent), standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  if (ios && !standalone) box.insertAdjacentHTML('beforeend', `<p class="savehint savebtn">Совет: в Safari нажмите «Поделиться» → «На экран „Домой“». Так игра откроется на весь экран, а прогресс точно не потеряется.</p>`);
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el) return;
  const a = el.dataset.a;
  if (a === 'continue') { e.stopImmediatePropagation(); startMusic(true); applySave(readSave()); return; }
  if (a === 'start' && UI.title) {
    const snap = readSave();
    if (snap && !snap.S.over && !el.dataset.sure) {
      e.stopImmediatePropagation();
      saveOverlay(`<h2>Начать заново?</h2><p>У вас есть сохранённая игра: ${saveLabel(snap)}. Если начать новую, этот прогресс пропадёт.</p><button class="primary" data-a="continue">Продолжить сохранённую</button><button class="ghost" data-a="newsure" data-id="${el.dataset.id}">Начать заново</button>`);
      return;
    }
  }
  if (a === 'newsure') {
    e.stopImmediatePropagation(); saveOverlay(''); clearSave();
    const b = document.querySelector(`#title [data-a=start][data-id="${el.dataset.id}"]`);
    if (b) { b.dataset.sure = 1; b.click(); delete b.dataset.sure; }
    return;
  }
  if (a === 'transfer') {
    e.stopImmediatePropagation();
    const snap = readSave();
    saveOverlay(`<h2>Перенос сохранения</h2>
      ${snap ? `<p>Скопируйте код и отправьте его себе, например в Telegram. На другом устройстве откройте игру и вставьте код ниже.</p><textarea class="savecode" readonly>${toCode(snap)}</textarea><button class="primary" data-a="copycode">Скопировать код</button>` : '<p>Сохранённой игры пока нет. Начните дело, и прогресс будет сохраняться сам.</p>'}
      <p style="margin-top:6px">Есть код с другого устройства? Вставьте его сюда:</p>
      <textarea class="savecode" id="pastecode" placeholder="SP1:…"></textarea>
      <button class="ghost" data-a="loadcode">Загрузить из кода</button>
      <button class="ghost" data-a="closesave">Закрыть</button>`);
    return;
  }
  if (a === 'copycode') {
    e.stopImmediatePropagation();
    const t = document.querySelector('#saveov .savecode'); t.select();
    (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(() => { el.textContent = 'Скопировано ✓'; }, () => { document.execCommand('copy'); el.textContent = 'Скопировано ✓'; });
    return;
  }
  if (a === 'loadcode') {
    e.stopImmediatePropagation();
    const snap = fromCode(document.getElementById('pastecode').value || '');
    if (!snap || !CASES[snap.cid]) { el.textContent = 'Код не подошёл, проверьте, что скопирован целиком'; return; }
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(snap)); } catch (e) {}
    saveOverlay(''); startMusic(true); applySave(snap);
    return;
  }
  if (a === 'closesave') { e.stopImmediatePropagation(); saveOverlay(''); return; }
}, true);

/* Finished case: drop the save so "Continue" does not reopen a closed case */
const _origRender = render;
render = function () {
  _origRender();
  if (S && !UI.title) { if (S.over) clearSave(); else saveGame(); }
  if (UI.title) drawTitleSave();
};
drawTitleSave();
