/* Products page — dropdown filters (category, pack size, type, sort) + live search */
document.addEventListener('DOMContentLoaded', () => {
  const $ = HF.$, grid = $('#pgrid'), f = { q: '', cat: 'all', tag: 'all', size: 'all', sort: 'pop' };
  $('#fCat').innerHTML = HF.catOptions();
  const params = new URLSearchParams(location.search); if (params.get('cat')) { f.cat = params.get('cat'); $('#fCat').value = f.cat; }
  const render = () => {
    const l = HF.filterProducts(f); $('#pcount').textContent = `${l.length} product${l.length === 1 ? '' : 's'}`;
    const sz = f.size === 'all' ? '500g' : f.size;
    grid.innerHTML = l.length ? l.map((p, i) => HF.productCard(p, sz, i)).join('') : `<div class="empty"><b>🍟</b>No products match your filters.<br><button class="btn btn-dark btn-sm mt" id="reset">Reset filters</button></div>`;
  };
  [['fCat', 'cat'], ['fSize', 'size'], ['fTag', 'tag'], ['fSort', 'sort']].forEach(([id, k]) => $('#' + id).addEventListener('change', e => { f[k] = e.target.value; render(); }));
  $('#fQ').addEventListener('input', e => { f.q = e.target.value; render(); });
  grid.addEventListener('click', e => { if (e.target.id === 'reset') { Object.assign(f, { q: '', cat: 'all', tag: 'all', size: 'all', sort: 'pop' }); ['fCat', 'fSize', 'fTag'].forEach(i => $('#' + i).value = 'all'); $('#fSort').value = 'pop'; $('#fQ').value = ''; render(); } });
  HF.bindShop(grid); render();
});
