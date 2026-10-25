document.addEventListener('DOMContentLoaded', () => {
  const $ = RT.$, grid = $('#vgrid'), modal = $('#modal'); const f = { q: '', cat: 'all' };
  $('#rCat').innerHTML = '<option value="all">All Recipe Types</option>' + [...new Set(RT.RECIPES.map(r => r.cat))].map(c => `<option>${c}</option>`).join('');
  const render = () => {
    const l = RT.RECIPES.filter(r => (f.cat === 'all' || r.cat === f.cat) && (!f.q || (r.title + r.product + r.cat).toLowerCase().includes(f.q)));
    $('#rcount').textContent = `${l.length} recipe${l.length === 1 ? '' : 's'}`;
    grid.innerHTML = l.length ? l.map((r, i) => `<article class="vcard" data-id="${r.id}" style="animation-delay:${Math.min(i, 12) * 40}ms">
      <div class="thumb" data-act="play"><img src="https://img.youtube.com/vi/${r.id}/hqdefault.jpg" alt="${r.title}" loading="lazy"><div class="play">▶</div><div class="meta"><span>⏱ ${r.mins} min</span><span>🍽 ${r.serves}</span></div></div>
      <div class="vbody"><small>${r.cat}</small><h3>${r.title}</h3><div class="vbtns"><button class="btn btn-dark" data-act="play">▶ Watch</button><button class="btn btn-y" style="box-shadow:none" data-act="pdf">⬇ PDF</button></div></div></article>`).join('')
      : '<div class="empty"><b>🍳</b>No recipes found. Try another keyword.</div>';
  };
  $('#rCat').addEventListener('change', e => { f.cat = e.target.value; render(); }); $('#rQ').addEventListener('input', e => { f.q = e.target.value.toLowerCase(); render(); });
  const open = r => {
    $('#mtitle').textContent = r.title; $('#mmeta').textContent = `${r.cat} • ⏱ ${r.mins} min • serves ${r.serves} • uses RT FOOD ${r.product}`;
    $('#mvid').innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${r.id}?autoplay=1&rel=0" title="${r.title}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    $('#ming').innerHTML = r.ingredients.map(i => `<li>${i}</li>`).join(''); $('#mstep').innerHTML = r.steps.map(i => `<li>${i}</li>`).join('');
    $('#mpdf').onclick = () => dl(r); $('#myt').href = 'https://www.youtube.com/watch?v=' + r.id; modal.classList.add('open'); document.body.style.overflow = 'hidden';
  };
  const close = () => { modal.classList.remove('open'); $('#mvid').innerHTML = ''; document.body.style.overflow = ''; };
  const dl = r => { try { RT.pdf.recipe(r); RT.toast('Recipe PDF downloaded', '📄'); } catch (e) { RT.toast('PDF library could not load — check internet', '⚠️'); } };
  grid.addEventListener('click', e => { const a = e.target.closest('[data-act]'); if (!a) return; const r = RT.RECIPES.find(x => x.id === a.closest('.vcard').dataset.id); a.dataset.act === 'pdf' ? dl(r) : open(r); });
  $('#mclose').addEventListener('click', close); modal.addEventListener('click', e => e.target === modal && close()); addEventListener('keydown', e => e.key === 'Escape' && close());
  render();
});
