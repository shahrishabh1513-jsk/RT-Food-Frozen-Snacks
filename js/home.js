/* Home — featured products, recipe teaser, brand marquees, live stats */
document.addEventListener('DOMContentLoaded', () => {
  const $ = RT.$, feat = $('#featured');
  const list = RT.PRODUCTS.filter(p => p.tag === 'Bestseller').slice(0, 8);
  feat.innerHTML = list.map((p, i) => RT.productCard(p, '500g', i)).join(''); RT.bindShop(feat);
  $('#rteaser').innerHTML = RT.RECIPES.filter((r, i) => [0, 6, 18].includes(i)).map(r => `
    <a class="vcard" href="Recipes.html"><div class="thumb"><img src="https://img.youtube.com/vi/${r.id}/hqdefault.jpg" alt="${r.title}" loading="lazy"><div class="play">▶</div><div class="meta"><span>⏱ ${r.mins} min</span></div></div><div class="vbody"><small>${r.cat}</small><h3>${r.title}</h3></div></a>`).join('');
  const mq = (id, arr) => { const h = arr.map(a => `<div><img src="assets/image/${a}" alt="" loading="lazy"></div>`).join(''); $(id).innerHTML = `<div class="mq-track">${h}${h}</div>`; };
  mq('#mq1', ['kfc.png', 'subway.png', 'pizza-hut.png', 'TACOBELL.png', 'BK.jpg', 'CARLS.png', 'WHATABURGER.png', 'sizzler.png', 'pvr.png', 'twc.png', 'kudu.jpg', 'thepizza.jpg']);
  mq('#mq2', ['Dmart.png', 'spencer.png', 'Reliance.png', 'bigbasket.png', 'blinkit.png', 'swiggy.png', 'jiomart.jpg', 'AmazonFresh.jpg']);
  const live = () => { const o = RT.store.get('orders', []); $('#liveOrders').textContent = o.length; $('#liveCart').textContent = RT.cart.count(); };
  live(); document.addEventListener('hf:update', live);
  const clock = () => $('#hubClock').textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); clock(); setInterval(clock, 1000);
});
