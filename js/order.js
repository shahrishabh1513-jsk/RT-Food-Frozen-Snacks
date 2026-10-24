/* ============================================================
   RT FOOD — Order flow
   start → login/signup → menu → cart → details → payment → bill → live tracking
   Everything persists in localStorage and syncs across tabs.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const $ = RT.$, $$ = RT.$$, R = RT.rupee, S = RT.store;
  const TRACK = { confirm: 10, pack: 28, pick: 42, ride: 100 };       // seconds — compressed demo timeline (edit freely)
  const STAGES = [['📝', 'Order confirmed', 'We received your order'], ['📦', 'Packing', 'Your frozen goodies are being packed in cold-chain boxes'], ['🧑‍🍳', 'Rider assigned', 'Rider is collecting your parcel'], ['🏍️', 'Out for delivery', 'Rider is on the way to you'], ['🎉', 'Delivered', 'Enjoy your RT FOOD!']];
  const STEP = { auth: 1, menu: 2, cart: 3, details: 4, pay: 5, bill: 6, track: 7 };
  const VIEWS = ['start', 'auth', 'menu', 'cart', 'details', 'pay', 'bill', 'track'];
  let timer = null, qrTimer = null, draftId = null, payMethod = 'upi', authMode = 'login';
  const user = () => S.get('user', null), orders = () => S.get('orders', []);
  const imgOf = p => 'assets/image/' + (RT.IMG_OVERRIDE[p.id] ? RT.IMG_OVERRIDE[p.id].replace('assets/image/', '') : p.photo);

  /* ---------- routing ---------- */
  const go = h => { location.hash = h; };
  function route(keep) {
    const [v0, arg] = (location.hash.slice(1) || 'start').split('/'); let v = VIEWS.includes(v0) ? v0 : 'start';
    if (['menu', 'cart', 'details', 'pay'].includes(v) && !user()) { v = 'auth'; }
    if (['details', 'pay'].includes(v) && !RT.cart.count()) { v = 'menu'; }
    if (['bill', 'track'].includes(v) && !orders().find(o => o.id === arg)) { v = 'start'; }
    clearInterval(timer); clearInterval(qrTimer);
    $$('.view').forEach(e => e.classList.toggle('show', e.id === 'v-' + v));
    $$('.sp').forEach(s => { const n = +s.dataset.s; s.classList.toggle('on', n === STEP[v]); s.classList.toggle('ok', n < (STEP[v] || 0)); });
    $('#fab').classList.toggle('on', v === 'menu' && RT.cart.count() > 0);
    ({ start: rStart, auth: rAuth, menu: rMenu, cart: rCart, details: rDetails, pay: rPay, bill: () => rBill(arg), track: () => rTrack(arg) })[v]();
    if (keep !== true) scrollTo({ top: 0, behavior: 'smooth' }); const u = user(); $('#who').innerHTML = u ? `Hi, <b>${u.name.split(' ')[0]}</b> · <a href="#" id="logout">Logout</a>` : '';
  }
  addEventListener('hashchange', () => route());

  /* ---------- start ---------- */
  function rStart() {
    const o = orders().slice().reverse().slice(0, 4);
    $('#myorders').innerHTML = o.length ? o.map(x => `<div class="mo"><span><b>${x.id}</b> · ${R(x.totals.total)}</span><span>${statusOf(x).label}</span><a class="btn btn-dark btn-sm" href="#track/${x.id}">Track</a></div>`).join('') : '<p style="color:var(--mute)">No orders yet — your first one is waiting! 🍟</p>';
  }
  $('#startBtn').onclick = () => go(user() ? 'menu' : 'auth');
  $('#trackForm').onsubmit = e => { e.preventDefault(); const id = $('#trackId').value.trim().toUpperCase(), o = orders().find(x => x.id === id); o ? go('track/' + id) : RT.toast('Order number not found on this device', '🔎'); };

  /* ---------- auth ---------- */
  const hash = s => btoa(unescape(encodeURIComponent(s)));
  function rAuth() { setAuth(authMode); }
  function setAuth(m) { authMode = m; $$('#authTabs button').forEach(b => b.classList.toggle('on', b.dataset.m === m)); $$('.signup-only').forEach(e => e.style.display = m === 'signup' ? '' : 'none'); $('#authBtn').textContent = m === 'signup' ? 'Create account' : 'Login'; $('#authErr').textContent = ''; $('#aId').placeholder = m === 'signup' ? 'Email address' : 'Email or phone number'; }
  $('#authTabs').onclick = e => e.target.dataset.m && setAuth(e.target.dataset.m);
  $('#authForm').onsubmit = e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)), users = S.get('users', []), err = m => $('#authErr').textContent = m;
    if (authMode === 'signup') {
      if (f.name.trim().length < 2) return err('Please enter your full name.'); if (!/^\S+@\S+\.\S+$/.test(f.id)) return err('Enter a valid email address.');
      if (!/^[6-9]\d{9}$/.test(f.phone)) return err('Enter a valid 10-digit mobile number.'); if (f.pass.length < 6) return err('Password needs at least 6 characters.');
      if (users.find(u => u.email === f.id.toLowerCase() || u.phone === f.phone)) return err('Account already exists — please login.');
      const u = { name: f.name.trim(), email: f.id.toLowerCase(), phone: f.phone, pw: hash(f.pass) }; users.push(u); S.set('users', users); S.set('user', { name: u.name, email: u.email, phone: u.phone }); RT.toast('Welcome to RT FOOD, ' + u.name.split(' ')[0] + '! Use code WELCOMERT', '🎉');
    } else {
      const u = users.find(u => (u.email === f.id.toLowerCase() || u.phone === f.id) && u.pw === hash(f.pass)); if (!u) return err('Wrong details. New here? Tap Sign up.');
      S.set('user', { name: u.name, email: u.email, phone: u.phone }); RT.toast('Welcome back, ' + u.name.split(' ')[0], '👋');
    }
    e.target.reset(); go('menu');
  };
  $('#guestBtn').onclick = () => { S.set('user', { name: 'Guest', guest: true }); go('menu'); };
  document.addEventListener('click', e => { if (e.target.id === 'logout') { e.preventDefault(); S.del('user'); RT.toast('Logged out', '👋'); go('start'); } });

  /* ---------- menu ---------- */
  const mf = { q: '', cat: 'all' };
  function rMenu() { $('#mCat').innerHTML = RT.catOptions(); $('#mCat').value = mf.cat; drawMenu(); fab(); }
  function drawMenu() { const l = RT.filterProducts({ ...mf, sort: 'pop' }); $('#mgrid').innerHTML = l.length ? l.map((p, i) => RT.productCard(p, '500g', i)).join('') : '<div class="empty"><b>🔍</b>Nothing matches your search.</div>'; $('#mcount').textContent = l.length + ' items'; }
  const fab = () => { const n = RT.cart.count(); $('#fab').classList.toggle('on', n > 0 && location.hash === '#menu'); $('#fabTxt').textContent = `View Cart (${n}) · ${R(RT.cart.totals().sub)}`; };
  $('#mCat').onchange = e => { mf.cat = e.target.value; drawMenu(); }; $('#mQ').oninput = e => { mf.q = e.target.value; drawMenu(); };
  RT.bindShop($('#mgrid'), fab); $('#fab').onclick = () => go('cart');

  /* ---------- cart ---------- */
  const couponMsg = (t, ok) => { $('#cpMsg').textContent = t; $('#cpMsg').style.color = ok ? 'var(--green)' : 'var(--red)'; };
  function summary(t, id) {
    $(id).innerHTML = `<div class="sum"><span>Subtotal</span><b>${R(t.sub)}</b></div>${t.discount ? `<div class="sum disc"><span>Discount (${t.coupon})</span><b>− ${R(t.discount)}</b></div>` : ''}
      <div class="sum"><span>Delivery</span><b>${t.ship ? R(t.ship) : 'FREE'}</b></div><div class="sum"><span>GST (${RT.GST_RATE * 100}%)</span><b>${R(t.gst)}</b></div><div class="sum total"><span>Total</span><span>${R(t.total)}</span></div>
      ${t.sub && !t.ship && t.sub < RT.FREE_DELIVERY_ABOVE ? '' : t.sub < RT.FREE_DELIVERY_ABOVE && t.sub ? `<p style="font-size:.8rem;color:var(--mute)">Add ${R(RT.FREE_DELIVERY_ABOVE - t.sub)} more for free delivery 🚚</p>` : ''}`;
  }
  function rCart() {
    const t = RT.cart.totals(S.get('coupon', null)); if (S.get('coupon') && !t.coupon) { S.del('coupon'); couponMsg('Coupon no longer applies to this cart.', false); }
    $('#cartList').innerHTML = t.lines.length ? t.lines.map(l => `<div class="crow" data-pid="${l.pid}" data-size="${l.size}"><img src="${imgOf(l.p)}" alt=""><div><b>${l.p.name}</b><br><small>${l.size} · ${R(l.unit)} each</small><div class="qty"><button data-q="-1">−</button><span>${l.qty}</span><button data-q="1">+</button></div></div><div><b>${R(l.total)}</b><button class="rm" data-rm>Remove</button></div></div>`).join('')
      : '<div class="empty"><b>🛒</b>Your cart is empty.<br><a class="btn btn-y mt" href="#menu">Browse the menu</a></div>';
    summary(t, '#cartSum'); $('#toDetails').disabled = !t.lines.length; $('#cpList').innerHTML = Object.entries(RT.COUPONS).map(([k, v]) => `<button type="button" title="${v.label}" data-cp="${k}">${k}</button>`).join('');
  }
  $('#cartList').onclick = e => { const row = e.target.closest('.crow'); if (!row) return; const { pid, size } = row.dataset, it = RT.cart.items().find(i => i.pid === pid && i.size === size);
    if (e.target.dataset.q) RT.cart.setQty(pid, size, it.qty + +e.target.dataset.q); if (e.target.hasAttribute('data-rm')) RT.cart.setQty(pid, size, 0); rCart(); };
  function applyCoupon(code) {
    code = code.trim().toUpperCase(); const c = RT.COUPONS[code], sub = RT.cart.totals().sub; if (!code) return;
    if (!c) return couponMsg('Invalid coupon code.', false); if (code === 'WELCOMERT' && orders().length) return couponMsg('WELCOMERT is valid on your first order only.', false);
    if (sub < c.min) return couponMsg(`Add ${R(c.min - sub)} more to use ${code}.`, false);
    S.set('coupon', code); rCart(); couponMsg(`🎉 ${code} applied — ${c.label}`, true);
  }
  $('#cpApply').onclick = () => applyCoupon($('#cpIn').value); $('#cpList').onclick = e => { if (e.target.dataset.cp) { $('#cpIn').value = e.target.dataset.cp; applyCoupon(e.target.dataset.cp); } };
  $('#toDetails').onclick = () => go('details');

  /* ---------- details ---------- */
  function rDetails() { const d = { ...(user() || {}), ...S.get('details', {}) }; ['name', 'phone', 'email', 'address', 'landmark', 'city', 'pin'].forEach(k => { const el = $('#d_' + k); if (el && d[k] && !el.value) el.value = d[k]; }); summary(RT.cart.totals(S.get('coupon')), '#detSum'); }
  $('#detForm').onsubmit = e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)), err = m => { $('#detErr').textContent = m; };
    if (!/^[6-9]\d{9}$/.test(f.phone)) return err('Enter a valid 10-digit mobile number.'); if (!/^\d{6}$/.test(f.pin)) return err('Enter a 6-digit PIN code.'); if (f.address.trim().length < 8) return err('Please enter your full address.');
    err(''); S.set('details', f); go('pay');
  };

  /* ---------- payment ---------- */
  const genId = () => { let id; do { const d = new Date(); id = `RT${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`; } while (orders().find(o => o.id === id)); return id; };
  function rPay() {
    draftId = draftId || genId(); const t = RT.cart.totals(S.get('coupon')); summary(t, '#paySum'); $('#payTotal').textContent = R(t.total); $('#payOrderNo').textContent = draftId;
    const d = S.get('details', {}); $('#payTo').innerHTML = `<b>${d.name}</b><br>${d.address}, ${d.city} – ${d.pin}<br>📞 ${d.phone}`; setPay(payMethod);
  }
  function setPay(m) {
    payMethod = m; $$('.pay-opts input').forEach(i => i.checked = i.value === m); $$('.ppanel').forEach(p => p.style.display = p.dataset.m === m ? '' : 'none');
    const t = RT.cart.totals(S.get('coupon')); $('#payBtn').textContent = m === 'upi' ? '✅ I have paid — Confirm order' : m === 'card' ? `🔒 Pay ${R(t.total)} securely` : '📦 Place order (Cash on Delivery)';
    clearInterval(qrTimer); if (m === 'upi') drawQR();
  }
  function drawQR() {
    const t = RT.cart.totals(S.get('coupon')); let left = 300, ref = draftId; const q = $('#qr');
    const mk = () => { q.innerHTML = ''; const link = `upi://pay?pa=${RT.UPI_ID}&pn=${encodeURIComponent('RT FOOD')}&am=${t.total}&cu=INR&tn=${encodeURIComponent('RTFOOD ' + ref)}&tr=${ref}`;
      if (window.QRCode) new QRCode(q, { text: link, width: 190, height: 190, correctLevel: QRCode.CorrectLevel.M }); else q.textContent = 'QR needs internet'; $('#upiLink').href = link; };
    mk(); const tick = () => { left--; if (left <= 0) { left = 300; ref = draftId + '-' + Math.random().toString(36).slice(2, 5).toUpperCase(); mk(); RT.toast('Payment QR refreshed', '🔄'); } $('#qrTime').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; }; tick(); qrTimer = setInterval(tick, 1000);
  }
  $('.pay-opts').onchange = e => setPay(e.target.value);
  $('#cardNo').oninput = e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  $('#cardExp').oninput = e => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); e.target.value = v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v; };
  const luhn = n => { let s = 0, d = false; for (let i = n.length - 1; i >= 0; i--) { let k = +n[i]; if (d) { k *= 2; if (k > 9) k -= 9; } s += k; d = !d; } return n.length >= 13 && s % 10 === 0; };
  $('#payBtn').onclick = () => {
    const err = m => { $('#payErr').textContent = m; return false; }; err('');
    if (payMethod === 'card') {
      const n = $('#cardNo').value.replace(/\s/g, ''), ex = $('#cardExp').value.split('/'), now = new Date();
      if (!luhn(n)) return err('Card number looks invalid. (Demo card: 4242 4242 4242 4242)'); if (!(+ex[0] >= 1 && +ex[0] <= 12) || (2000 + +ex[1]) * 12 + +ex[0] < now.getFullYear() * 12 + now.getMonth() + 1) return err('Card expiry is invalid or expired.');
      if (!/^\d{3,4}$/.test($('#cardCvv').value)) return err('Enter a valid CVV.'); if ($('#cardName').value.trim().length < 2) return err('Enter the name on the card.');
    }
    const btn = $('#payBtn'); btn.disabled = true; btn.innerHTML = '<span class="timer">Processing…</span>'; setTimeout(() => { btn.disabled = false; placeOrder(); }, payMethod === 'cod' ? 700 : 1800);
  };

  /* ---------- place order ---------- */
  function placeOrder() {
    const t = RT.cart.totals(S.get('coupon')), d = S.get('details'), u = user(), id = draftId || genId();
    const o = { id, createdAt: Date.now(), customer: { name: d.name, phone: d.phone, email: d.email || u.email || '', address: d.address + (d.landmark ? ' (Near ' + d.landmark + ')' : ''), city: d.city, pin: d.pin }, payment: { method: payMethod, status: payMethod === 'cod' ? 'Pay on delivery' : 'Paid' },
      items: t.lines.map(l => ({ pid: l.pid, name: l.p.name, size: l.size, qty: l.qty, unit: l.unit })), totals: { sub: t.sub, discount: t.discount, ship: t.ship, gst: t.gst, total: t.total, coupon: t.coupon }, dest: null, route: null };
    const all = orders(); all.push(o); S.set('orders', all); draftId = null; go('bill/' + id); RT.cart.clear(); S.del('coupon');
    geocode(o).then(dest => update(id, { dest })); confetti();
  }
  const update = (id, patch) => { const all = orders(), o = all.find(x => x.id === id); if (o) { Object.assign(o, patch); S.set('orders', all); } };
  const confetti = () => { for (let i = 0; i < 36; i++) { const c = document.createElement('div'); c.className = 'confetti'; c.textContent = ['🍟', '🎉', '✨', '🥔', '💛'][i % 5]; c.style.left = Math.random() * 100 + 'vw'; c.style.animationDelay = Math.random() * .8 + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 4200); } };

  /* ---------- bill ---------- */
  function rBill(id) {
    const o = orders().find(x => x.id === id), c = o.customer, t = o.totals;
    $('#billWrap').innerHTML = `<div class="success"><div class="check">✓</div><h2>Order placed!</h2><p>Thank you, ${c.name.split(' ')[0]}. Your order number is</p><div class="onum">${o.id}</div><p style="font-size:.9rem">Keep this number to track your order any time.</p></div>
    <div class="bill" id="billDoc"><div class="bill-h"><div><h2>TAX INVOICE</h2><small>Order No: <b>${o.id}</b><br>Date: ${new Date(o.createdAt).toLocaleString('en-IN')}</small></div><img src="assets/image/logo.png" alt="RT FOOD"></div>
      <div class="bill-info"><div><b>Billed to</b>${c.name}<br>${c.address}, ${c.city} – ${c.pin}<br>📞 ${c.phone}</div><div><b>Payment</b>${{ upi: 'UPI', card: 'Card', cod: 'Cash on Delivery' }[o.payment.method]} — ${o.payment.status}<br>RT FOOD, Ahmedabad<br>GSTIN: 24XXXXXXXXXXXZ5</div></div>
      <div style="overflow-x:auto"><table><tr><th>#</th><th>Product</th><th>Pack</th><th>Qty</th><th class="r">Price</th><th class="r">Amount</th></tr>${o.items.map((i, n) => `<tr><td>${n + 1}</td><td>${i.name}</td><td>${i.size}</td><td>${i.qty}</td><td class="r">${R(i.unit)}</td><td class="r">${R(i.unit * i.qty)}</td></tr>`).join('')}</table></div>
      <div style="max-width:300px;margin-left:auto"><div class="sum"><span>Subtotal</span><b>${R(t.sub)}</b></div>${t.discount ? `<div class="sum disc"><span>Discount (${t.coupon})</span><b>− ${R(t.discount)}</b></div>` : ''}<div class="sum"><span>Delivery</span><b>${t.ship ? R(t.ship) : 'FREE'}</b></div><div class="sum"><span>CGST ${RT.GST_RATE * 50}%</span><b>${R(Math.round(t.gst / 2))}</b></div><div class="sum"><span>SGST ${RT.GST_RATE * 50}%</span><b>${R(t.gst - Math.round(t.gst / 2))}</b></div><div class="sum total"><span>Total</span><span>${R(t.total)}</span></div></div>
      <div class="sign"><small>Thank you for choosing RT FOOD!<br>Keep frozen at −18 °C.</small><div style="text-align:center"><div class="sg">RT FOOD</div><small><b>Authorised Signatory</b></small></div></div></div>
    <div class="actions"><button class="btn btn-dark" id="bPrint">🖨 Print bill</button><button class="btn btn-y" id="bPdf">⬇ Download PDF</button><a class="btn btn-red" href="#track/${o.id}">📍 Track my order</a></div>`;
    $('#bPrint').onclick = () => print(); $('#bPdf').onclick = () => { try { RT.pdf.bill(o); } catch (e) { RT.toast('PDF library could not load — check internet', '⚠️'); } };
  }

  /* ---------- tracking ---------- */
  function statusOf(o) {
    const e = (Date.now() - o.createdAt) / 1000, T = TRACK; let i, p = 0;
    if (e < T.confirm) i = 0; else if (e < T.pack) i = 1; else if (e < T.pick) i = 2; else if (e < T.pick + T.ride) { i = 3; p = (e - T.pick) / T.ride; } else { i = 4; p = 1; }
    return { i, p, label: STAGES[i][1], eta: Math.max(0, Math.ceil(T.pick + T.ride - e)), overall: Math.min(1, e / (T.pick + T.ride)) };
  }
  async function geocode(o) {
    const q = async s => { const c = new AbortController(), t = setTimeout(() => c.abort(), 6000); try { const r = await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=' + encodeURIComponent(s), { signal: c.signal })).json(); return r[0] ? { lat: +r[0].lat, lng: +r[0].lon } : null; } catch (e) { return null; } finally { clearTimeout(t); } };
    const c = o.customer; let d = await q(`${c.address}, ${c.city}, ${c.pin}`) || await q(`${c.pin}, ${c.city}`) || await q(`${c.pin}, India`);
    if (!d) { let h = 0; [...o.id].forEach(ch => h = (h * 31 + ch.charCodeAt(0)) % 997); const a = h / 997 * 6.28, km = 3 + h % 5; d = { lat: RT.HUB.lat + Math.sin(a) * km / 111, lng: RT.HUB.lng + Math.cos(a) * km / 108, approx: true }; }
    return d;
  }
  async function getRoute(o) {
    const a = [RT.HUB.lat, RT.HUB.lng], b = [o.dest.lat, o.dest.lng], c = new AbortController(), t = setTimeout(() => c.abort(), 7000);
    try { const r = await (await fetch(`https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`, { signal: c.signal })).json(); const pts = r.routes[0].geometry.coordinates.map(p => [p[1], p[0]]); const step = Math.ceil(pts.length / 220); return pts.filter((_, i) => i % step === 0 || i === pts.length - 1); }
    catch (e) { const pts = [], mid = [(a[0] + b[0]) / 2 + (b[1] - a[1]) * .12, (a[1] + b[1]) / 2 - (b[0] - a[0]) * .12]; for (let k = 0; k <= 1; k += .02) pts.push([(1 - k) ** 2 * a[0] + 2 * (1 - k) * k * mid[0] + k * k * b[0], (1 - k) ** 2 * a[1] + 2 * (1 - k) * k * mid[1] + k * k * b[1]]); return pts; } finally { clearTimeout(t); }
  }
  let tmap = null;
  async function rTrack(id) {
    let o = orders().find(x => x.id === id); $('#tOrder').textContent = o.id; $('#tAmt').textContent = (o.payment.method === 'cod' ? 'Collect on delivery: ' : 'Paid: ') + R(o.totals.total); $('#tAddr').textContent = `${o.customer.address}, ${o.customer.city} – ${o.customer.pin}`;
    $('#tBill').href = '#bill/' + id; $('#tSteps').innerHTML = STAGES.map((s, i) => `<li data-i="${i}"><i>${s[0]}</i>${s[1]}<small>${s[2]}</small></li>`).join('');
    if (tmap) { tmap.remove(); tmap = null; }
    if (typeof L === 'undefined') { $('#tmap').innerHTML = '<p class="empty">Map needs an internet connection.</p>'; }
    if (!o.dest) { $('#tMsg').textContent = 'Locating your address…'; o.dest = await geocode(o); update(id, { dest: o.dest }); }
    if (!o.route) { $('#tMsg').textContent = 'Finding the fastest route…'; o.route = await getRoute(o); update(id, { route: o.route }); }
    if (location.hash !== '#track/' + id) return; $('#tMsg').textContent = o.dest.approx ? 'Approximate location (address could not be pinpointed)' : 'Live tracking is on';
    const r = o.route; let rider, trail, last = 0; const cum = [0]; for (let i = 1; i < r.length; i++) cum.push(cum[i - 1] + Math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1])); const tot = cum[cum.length - 1] || 1;
    const at = p => { const d = p * tot; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const k = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return [r[i - 1][0] + (r[i][0] - r[i - 1][0]) * k, r[i - 1][1] + (r[i][1] - r[i - 1][1]) * k, i]; };
    if (typeof L !== 'undefined') {
      tmap = L.map('tmap', { zoomControl: true, scrollWheelZoom: false }); L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap © CARTO', maxZoom: 18 }).addTo(tmap);
      L.polyline(r, { color: '#262626', weight: 5, opacity: .25 }).addTo(tmap); trail = L.polyline([], { color: '#FF4D2E', weight: 5 }).addTo(tmap);
      const ic = (h, s = 34) => L.divIcon({ className: '', html: h, iconSize: [s, s], iconAnchor: [s / 2, s / 2] });
      L.marker(r[0], { icon: ic('<div class="hub-ico">🏭</div>') }).addTo(tmap).bindPopup('RT FOOD Dispatch Hub'); L.marker(r[r.length - 1], { icon: ic('<div class="hub-ico">🏠</div>') }).addTo(tmap).bindPopup('Your delivery address');
      rider = L.marker(r[0], { icon: ic('<div class="rider"><span>🏍️</span></div>', 44), zIndexOffset: 1000 }).addTo(tmap); tmap.fitBounds(L.latLngBounds(r).pad(.25)); setTimeout(() => tmap.invalidateSize(), 300);
    }
    let done = false;
    const tick = () => {
      const s = statusOf(orders().find(x => x.id === id) || o);
      $$('#tSteps li').forEach(li => { const i = +li.dataset.i; li.classList.toggle('ok', i < s.i || s.i === 4); li.classList.toggle('cur', i === s.i && s.i < 4); });
      $('#tBar').style.width = s.overall * 100 + '%'; $('#tEta').textContent = s.i === 4 ? 'Delivered' : `${Math.floor(s.eta / 60)}:${String(s.eta % 60).padStart(2, '0')}`; $('#tStatus').textContent = s.i === 4 ? '🎉 Delivered — enjoy!' : STAGES[s.i][0] + ' ' + STAGES[s.i][1];
      $('#tDist').textContent = s.i === 3 ? `${Math.max(0.1, (1 - s.p) * (tot * 111)).toFixed(1)} km away` : s.i === 4 ? 'Arrived' : 'Preparing';
      if (rider) { const p = s.i < 3 ? 0 : s.i === 4 ? 1 : s.p, [la, ln, ix] = at(p); const prev = r[Math.max(0, ix - 1)], nxt = r[ix]; rider.setLatLng([la, ln]); const el = rider.getElement(); if (el) el.firstChild.style.transform = nxt[1] < prev[1] ? 'scaleX(-1)' : ''; const pts = r.slice(0, ix).concat([[la, ln]]); trail.setLatLngs(p ? pts : []); if (s.i === 3 && tmap && Date.now() - last > 4000) { last = Date.now(); tmap.panTo([la, ln], { animate: true }); } }
      if (s.i === 4 && !done) { done = true; if (Date.now() - o.createdAt < (TRACK.pick + TRACK.ride + 8) * 1000) { confetti(); RT.toast('Your order has been delivered!', '🎉'); } clearInterval(timer); }
    };
    tick(); timer = setInterval(tick, 500);
  }

  if (!location.hash) history.replaceState(null, '', '#start'); route();
  document.addEventListener('hf:update', e => { if (['cart', 'coupon'].includes(e.detail) && ['#cart', '#pay', '#details'].includes(location.hash)) route(true); if (location.hash === '#menu') fab(); });
});
