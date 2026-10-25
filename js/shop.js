/* ============================================================
   RT FOOD — shared product card + filters (home, products, order)
   ============================================================ */
RT.IMG_OVERRIDE = {};   // e.g. { 'french-fries': 'assets/image/my-fries.jpg' }  → own photo per product
RT.imgSrc = p => RT.IMG_OVERRIDE[p.id] || 'assets/image/' + encodeURIComponent(p.img);
RT.imgFallback = (el, id) => {   // if a product photo is missing, show the category photo instead
  const p = RT.PRODUCTS.find(x => x.id === id); el.onerror = null; el.src = 'assets/image/' + encodeURIComponent(p.photo);
  el.style.objectPosition = p.pos; el.style.transformOrigin = p.pos; el.style.setProperty('--z', p.zoom);
};
RT.productCard = (p, size = '500g', i = 0) => {
  if (!p.sizes.includes(size)) size = p.sizes.includes('500g') ? '500g' : p.sizes[0];
  const cat = RT.CATS.find(c => c.id === p.cat), img = RT.imgSrc(p);
  return `<article class="pcard" data-pid="${p.id}" data-size="${size}" style="animation-delay:${Math.min(i, 12) * 45}ms">
    <div class="pimg">${p.tag ? `<span class="tag">${p.tag}</span>` : ''}<img src="${img}" alt="${p.name}" loading="lazy" style="object-position:center;--z:1" onerror="RT.imgFallback(this,'${p.id}')"><span class="em">${p.icon}</span></div>
    <div class="pbody"><small>${cat.label}</small><h3>${p.name}</h3><p>${p.desc}</p>
      <div class="sizes">${p.sizes.map(s => `<button type="button" data-size="${s}" class="${s === size ? 'on' : ''}">${s}</button>`).join('')}</div>
      <div class="prow"><span class="price">${RT.rupee(RT.price(p, size))}</span><small>+ GST at checkout</small></div>
      <div class="pbtns"><button class="btn btn-dark" data-act="add">🛒 Add</button><button class="btn btn-y" data-act="buy" style="box-shadow:none">⚡ Buy Now</button></div></div></article>`;
};
RT.bindShop = (root, onAdd) => root.addEventListener('click', e => {
  const card = e.target.closest('.pcard'); if (!card) return; const p = RT.PRODUCTS.find(x => x.id === card.dataset.pid);
  const chip = e.target.closest('.sizes button');
  if (chip) { card.dataset.size = chip.dataset.size; card.querySelectorAll('.sizes button').forEach(b => b.classList.toggle('on', b === chip)); const pr = card.querySelector('.price'); pr.textContent = RT.rupee(RT.price(p, chip.dataset.size)); pr.classList.remove('pop'); void pr.offsetWidth; pr.classList.add('pop'); return; }
  const act = e.target.closest('[data-act]'); if (!act) return;
  RT.cart.add(p.id, card.dataset.size, 1);
  if (act.dataset.act === 'buy') { location.href = 'order.html#cart'; return; }
  RT.toast(`${p.name} (${card.dataset.size}) added to cart`, '🛒'); onAdd && onAdd();
});
RT.filterProducts = ({ q = '', cat = 'all', tag = 'all', size = 'all', sort = 'pop' } = {}) => {
  q = q.trim().toLowerCase();
  let l = RT.PRODUCTS.filter(p => (cat === 'all' || p.cat === cat) && (size === 'all' || p.sizes.includes(size)) &&
    (tag === 'all' || (tag === 'Veg' ? true : p.tag === tag)) && (!q || (p.name + ' ' + p.desc + ' ' + p.tag).toLowerCase().includes(q)));
  if (sort === 'low') l.sort((a, b) => a.base - b.base); if (sort === 'high') l.sort((a, b) => b.base - a.base); if (sort === 'az') l.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'pop') l.sort((a, b) => (b.tag === 'Bestseller') - (a.tag === 'Bestseller'));
  return l;
};
RT.catOptions = (all = 'All Categories') => `<option value="all">${all}</option>` + RT.CATS.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
