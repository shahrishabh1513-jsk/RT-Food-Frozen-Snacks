(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  RT.$ = $; RT.$$ = $$;
  RT.rupee = n => '₹' + Number(n).toLocaleString('en-IN');

  /* ---------- storage (JSON in localStorage, synced across tabs) ---------- */
  RT.store = {
    get(k, d) { try { const v = localStorage.getItem('rtfood_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('rtfood_' + k, JSON.stringify(v)); } catch (e) {} document.dispatchEvent(new CustomEvent('hf:update', { detail: k })); },
    del(k) { try { localStorage.removeItem('rtfood_' + k); } catch (e) {} document.dispatchEvent(new CustomEvent('hf:update', { detail: k })); }
  };
  window.addEventListener('storage', e => e.key && e.key.startsWith('rtfood_') && document.dispatchEvent(new CustomEvent('hf:update', { detail: e.key.slice(7) })));

  /* ---------- cart ---------- */
  RT.cart = {
    items() { return RT.store.get('cart', []); },
    count() { return this.items().reduce((a, i) => a + i.qty, 0); },
    add(pid, size, qty = 1) {
      const c = this.items(); const f = c.find(i => i.pid === pid && i.size === size);
      f ? f.qty += qty : c.push({ pid, size, qty }); RT.store.set('cart', c);
    },
    setQty(pid, size, qty) {
      let c = this.items(); const f = c.find(i => i.pid === pid && i.size === size);
      if (f) f.qty = qty; c = c.filter(i => i.qty > 0); RT.store.set('cart', c);
    },
    clear() { RT.store.set('cart', []); },
    lines() { return this.items().map(i => { const p = RT.PRODUCTS.find(x => x.id === i.pid); return p ? { ...i, p, unit: RT.price(p, i.size), total: RT.price(p, i.size) * i.qty } : null; }).filter(Boolean); },
    totals(couponCode) {
      const lines = this.lines(); const sub = lines.reduce((a, l) => a + l.total, 0);
      let discount = 0, ship = sub === 0 || sub >= RT.FREE_DELIVERY_ABOVE ? 0 : RT.DELIVERY_FEE; let cp = RT.COUPONS[couponCode];
      if (cp && sub >= cp.min) {
        if (cp.type === 'flat') discount = cp.value;
        if (cp.type === 'pct') discount = Math.min(Math.round(sub * cp.value / 100), cp.max);
        if (cp.type === 'ship') ship = 0;
      } else cp = null;
      discount = Math.min(discount, sub);
      const taxable = sub - discount, gst = Math.round(taxable * RT.GST_RATE);
      return { lines, sub, discount, ship, gst, taxable, total: taxable + gst + ship, coupon: cp ? couponCode : null };
    }
  };

  /* ---------- toast ---------- */
  RT.toast = (msg, icon = '✅') => {
    let w = $('#toasts'); if (!w) { w = document.createElement('div'); w.id = 'toasts'; document.body.appendChild(w); }
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = `<span>${icon}</span>${msg}`; w.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2600); setTimeout(() => t.remove(), 3000);
  };

  /* ---------- header / footer ---------- */
  const NAV = [['index.html', 'Home'], ['about.html', 'About'], ['seedtoshelf.html', 'Seed to Shelf'], ['products.html', 'Products'], ['Exports.html', 'Exports'], ['Recipes.html', 'Recipes'], ['culture.html', 'Culture'], ['connect.html', 'Connect']];
  const page = (location.pathname.split('/').pop() || 'index.html');
  const active = h => h.toLowerCase() === page.toLowerCase() ? 'active' : '';
  const hd = $('#site-header');
  if (hd) hd.outerHTML = `
  <header class="nav" id="nav"><div class="wrap nav-in">
    <a href="index.html" class="brand" aria-label="RT FOOD home"><img src="assets/image/logo.png" alt="RT FOOD logo"></a>
    <nav class="links" id="links">${NAV.map(n => `<a href="${n[0]}" class="${active(n[0])}">${n[1]}</a>`).join('')}
      <a href="order.html" class="btn btn-sm btn-dark m-only">Order Now</a></nav>
    <div class="nav-actions">
      <a href="order.html" class="cart-btn" id="cartBtn" aria-label="Cart">🛒<b id="cartCount">0</b></a>
      <a href="order.html" class="btn btn-sm btn-dark d-only">Order Now</a>
      <button class="burger" id="burger" aria-label="Menu"><i></i><i></i><i></i></button>
    </div></div></header>`;
  const ft = $('#site-footer');
  if (ft) ft.outerHTML = `
  <footer class="footer"><div class="wrap">
    <div class="f-grid">
      <div><img src="assets/image/logo.png" alt="RT FOOD" class="f-logo"><p>Frozen Snacks &amp; French Fries — made from farm-fresh potatoes, loved in 45+ countries.</p>
        <div class="socials"><a href="#" aria-label="Facebook">f</a><a href="#" aria-label="LinkedIn">in</a><a href="#" aria-label="Instagram">◎</a><a href="Recipes.html" aria-label="YouTube">▶</a></div></div>
      <div><h4>Explore</h4>${NAV.slice(0, 5).map(n => `<a href="${n[0]}">${n[1]}</a>`).join('')}<a href="order.html">Order Now</a></div>
      <div><h4>Offices</h4><p><b>Corporate:</b> Krishna Plaza opp. sumandeep collage, near suzlon company, Vadodara, Gujarat 391760</p><p><b>Plant:</b> Mehsana–Ahmedabad Highway, Mehsana – 384450</p><p><b>Sales:</b> COWRKS, DLF Cyber City, Gurugram – 122002</p></div>
      <div><h4>Contact</h4><p>📞 <a href="tel:+917861976128">+91 78619 76128</a></p><p>✉️ Enquiries: <a href="mailto:about@hyfunfoods.com">about@hyfunfoods.com</a></p><p>🛒 Orders: <a href="mailto:sales@hyfunfoods.com">sales@hyfunfoods.com</a></p>
        <div class="certs"><img src="assets/image/fssai.jpeg" alt="FSSAI"><img src="assets/image/Kosher.png" alt="Kosher"><img src="assets/image/sedex.png" alt="Sedex"><img src="assets/image/brc.jpg" alt="BRC"></div></div>
    </div>
    <div class="f-bottom"><span>© ${new Date().getFullYear()} RT FOOD. All rights reserved.</span><span>Designed &amp; Developed by <b>RT1504</b></span></div>
    <p class="disc">⚠️ This website is made for educational purposes only. No real products are sold, paid for or delivered.</p>
  </div></footer>
  <button class="to-top" id="toTop" aria-label="Back to top">↑</button>`;

  /* ---------- cart badge (live) ---------- */
  const badge = () => { const n = RT.cart.count(), b = $('#cartCount'); if (b) { b.textContent = n; b.classList.toggle('on', n > 0); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); } };
  document.addEventListener('hf:update', badge);

  /* ---------- loader ---------- */
  const loader = $('#loader'), t0 = performance.now();
  const hide = () => { if (!loader) return; setTimeout(() => { loader.classList.add('done'); document.body.classList.remove('loading'); setTimeout(() => loader.style.display = 'none', 700); }, Math.max(0, 1100 - (performance.now() - t0))); };
  document.readyState === 'complete' ? hide() : window.addEventListener('load', hide);
  setTimeout(hide, 4000);
  window.addEventListener('pageshow', e => { if (e.persisted && loader) { loader.style.display = 'none'; document.body.classList.remove('loading'); } });

  document.addEventListener('DOMContentLoaded', () => {
    badge();
    const nav = $('#nav'), tt = $('#toTop');
    const onScroll = () => { nav && nav.classList.toggle('scrolled', scrollY > 30); tt && tt.classList.toggle('show', scrollY > 600); const p = $('#progress'); if (p) p.style.width = (scrollY / (document.body.scrollHeight - innerHeight) * 100) + '%'; };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    tt && tt.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
    const bg = $('#burger'); bg && bg.addEventListener('click', () => { bg.classList.toggle('open'); $('#links').classList.toggle('open'); });

    /* scroll reveal + counters */
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return; const el = en.target; el.classList.add('in'); io.unobserve(el);
      if (el.dataset.count) { const end = +el.dataset.count, suf = el.dataset.suffix || '', t = performance.now(); (function step(n) { const k = Math.min((n - t) / 1600, 1); el.textContent = Math.floor(end * (1 - Math.pow(1 - k, 3))).toLocaleString('en-IN') + suf; k < 1 && requestAnimationFrame(step); })(t); }
    }), { threshold: .15 });
    $$('.reveal,[data-count]').forEach(el => io.observe(el));

    /* 3D tilt on cards */
    $$('.tilt').forEach(c => { c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); c.style.transform = `perspective(700px) rotateX(${-((e.clientY - r.top) / r.height - .5) * 7}deg) rotateY(${((e.clientX - r.left) / r.width - .5) * 7}deg) translateY(-4px)`; }); c.addEventListener('mouseleave', () => c.style.transform = ''); });

    /* accordion */
    $$('.acc-q').forEach(q => q.addEventListener('click', () => q.parentElement.classList.toggle('open')));
  });
})();
