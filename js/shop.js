/* ============================================================
   HY FUN — shared product card + filters (home, products, order)
   ============================================================ */
HF.IMG_OVERRIDE = {};   // e.g. { 'french-fries': 'assets/image/my-fries.jpg' }  → own photo per product
HF.productCard = (p, size = '500g', i = 0) => {
  if (!p.sizes.includes(size)) size = p.sizes.includes('500g') ? '500g' : p.sizes[0];
  const cat = HF.CATS.find(c => c.id === p.cat), img = HF.IMG_OVERRIDE[p.id] || 'assets/image/' + p.photo;
  return `<article class="pcard" data-pid="${p.id}" data-size="${size}" style="animation-delay:${Math.min(i, 12) * 45}ms">
    <div class="pimg">${p.tag ? `<span class="tag">${p.tag}</span>` : ''}<img src="${img}" alt="${p.name}" loading="lazy" style="object-position:${p.pos};transform-origin:${p.pos};--z:${p.zoom}"><span class="em">${p.icon}</span></div>
    <div class="pbody"><small>${cat.label}</small><h3>${p.name}</h3><p>${p.desc}</p>
      <div class="sizes">${p.sizes.map(s => `<button type="button" data-size="${s}" class="${s === size ? 'on' : ''}">${s}</button>`).join('')}</div>
      <div class="prow"><span class="price">${HF.rupee(HF.price(p, size))}</span><small>incl. in cart GST extra</small></div>
      <div class="pbtns"><button class="btn btn-dark" data-act="add">🛒 Add</button><button class="btn btn-y" data-act="buy" style="box-shadow:none">⚡ Buy Now</button></div></div></article>`;
};
HF.bindShop = (root, onAdd) => root.addEventListener('click', e => {
  const card = e.target.closest('.pcard'); if (!card) return; const p = HF.PRODUCTS.find(x => x.id === card.dataset.pid);
  const chip = e.target.closest('.sizes button');
  if (chip) { card.dataset.size = chip.dataset.size; card.querySelectorAll('.sizes button').forEach(b => b.classList.toggle('on', b === chip)); const pr = card.querySelector('.price'); pr.textContent = HF.rupee(HF.price(p, chip.dataset.size)); pr.classList.remove('pop'); void pr.offsetWidth; pr.classList.add('pop'); return; }
  const act = e.target.closest('[data-act]'); if (!act) return;
  HF.cart.add(p.id, card.dataset.size, 1);
  if (act.dataset.act === 'buy') { location.href = 'order.html#cart'; return; }
  HF.toast(`${p.name} (${card.dataset.size}) added to cart`, '🛒'); onAdd && onAdd();
});
HF.filterProducts = ({ q = '', cat = 'all', tag = 'all', size = 'all', sort = 'pop' } = {}) => {
  q = q.trim().toLowerCase();
  let l = HF.PRODUCTS.filter(p => (cat === 'all' || p.cat === cat) && (size === 'all' || p.sizes.includes(size)) &&
    (tag === 'all' || (tag === 'Veg' ? true : p.tag === tag)) && (!q || (p.name + ' ' + p.desc + ' ' + p.tag).toLowerCase().includes(q)));
  if (sort === 'low') l.sort((a, b) => a.base - b.base); if (sort === 'high') l.sort((a, b) => b.base - a.base); if (sort === 'az') l.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'pop') l.sort((a, b) => (b.tag === 'Bestseller') - (a.tag === 'Bestseller'));
  return l;
};
HF.catOptions = (all = 'All Categories') => `<option value="all">${all}</option>` + HF.CATS.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
