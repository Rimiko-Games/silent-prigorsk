/* Silent Prigorsk · Keyboard for PC: 1–9 pick a line or a section, Enter accepts a card, Esc closes. */
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
  const q = s => document.querySelector(s);
  const press = el => { if (el) { e.preventDefault(); el.click(); return true; } return false; };

  // Cards on top of everything: radio, notes, reveal, save overlay, travel animation
  const top = q('#saveov .rv') || q('#radios .rv') || q('#notes .rv') || q('#reveal .rv') || q('#trav .tv');
  if (top) {
    if (top.classList.contains('tv')) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') press(top); return; }
    if (e.key === 'Enter' || e.key === ' ') return void press(top.querySelector('.primary, [data-a=rok], [data-a=nok]'));
    if (e.key === 'Escape') return void press(top.querySelector('[data-a=rvclose], [data-a=closesave], .ghost, [data-a=rok], [data-a=nok], .primary'));
    return;
  }
  if (!S || UI.title) return;

  const modal = q('#modal .sheet');
  if (modal) {
    if (e.key === 'Escape') return void press(modal.querySelector('.x'));
    if (/^[1-9]$/.test(e.key)) {
      const opts = modal.querySelectorAll('.opts > button, .opts > .act');
      press(opts[+e.key - 1]);
    }
    return;
  }
  if (/^[1-5]$/.test(e.key)) press(document.querySelectorAll('#nav button[data-a=tab]')[+e.key - 1]);
});
