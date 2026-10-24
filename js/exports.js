/* Exports — interactive world map with every destination */
document.addEventListener('DOMContentLoaded', () => {
  const $ = RT.$, box = $('#worldmap'); if (typeof L === 'undefined') { box.innerHTML = '<p class="empty">Map needs an internet connection to load.</p>'; return; }
  const hub = [23.59, 72.37];
  const map = L.map('worldmap', { worldCopyJump: true, minZoom: 2, scrollWheelZoom: false }).setView([22, 40], 2);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap © CARTO', maxZoom: 8 }).addTo(map);
  map.on('click', () => map.scrollWheelZoom.enable());
  L.marker(hub, { icon: L.divIcon({ className: '', html: '<div class="hub-ico">🏭</div>', iconSize: [30, 30], iconAnchor: [15, 15] }), zIndexOffset: 900 }).addTo(map).bindPopup('<b>RT FOOD Plant</b><br>Mehsana, Gujarat — India<br>Where every shipment begins');
  const arc = (a, b) => { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], dx = b[1] - a[1], dy = b[0] - a[0], len = Math.hypot(dx, dy), c = [m[0] + len * .22, m[1] - dy / len * 0 + 0]; const pts = []; for (let t = 0; t <= 1; t += .02) pts.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]); return pts; };
  let route = null, active = 'all'; const layer = L.layerGroup().addTo(map), markers = {};
  const go = c => { route && map.removeLayer(route); route = L.polyline(arc(hub, [c.lat, c.lng]), { color: RT.REGION_COLORS[c.region], weight: 3, dashArray: '8 10', className: 'flow' }).addTo(map); markers[c.name].openPopup(); map.flyTo([c.lat, c.lng], Math.max(map.getZoom(), 3), { duration: 1.2 }); };
  RT.COUNTRIES.forEach(c => {
    const col = RT.REGION_COLORS[c.region];
    const m = L.marker([c.lat, c.lng], { icon: L.divIcon({ className: '', html: `<div class="pin" style="background:${col};color:${col}"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] }) }).bindPopup(`<b>${c.name}</b><br><span style="color:${col}">● ${c.region}</span><br>RT FOOD products shipped here 🚢`);
    m.on('click', () => go(c)); markers[c.name] = m; c.m = m;
  });
  const regions = [...new Set(RT.COUNTRIES.map(c => c.region))];
  $('#chips').innerHTML = `<button data-r="all" class="on">🌍 All (${RT.COUNTRIES.length})</button>` + regions.map(r => `<button data-r="${r}"><i style="background:${RT.REGION_COLORS[r]}"></i>${r} (${RT.COUNTRIES.filter(c => c.region === r).length})</button>`).join('');
  const draw = () => {
    layer.clearLayers(); const l = RT.COUNTRIES.filter(c => active === 'all' || c.region === active); l.forEach(c => layer.addLayer(c.m));
    $('#clist').innerHTML = l.map(c => `<span data-n="${c.name}">${c.name}</span>`).join('');
    if (active !== 'all') map.fitBounds(L.latLngBounds(l.map(c => [c.lat, c.lng])).pad(.5), { maxZoom: 5 }); else map.setView([22, 40], 2);
  };
  $('#chips').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; active = b.dataset.r; RT.$$('#chips button').forEach(x => x.classList.toggle('on', x === b)); draw(); });
  $('#clist').addEventListener('click', e => { const s = e.target.closest('span'); if (s) { go(RT.COUNTRIES.find(c => c.name === s.dataset.n)); $('#worldmap').scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
  draw();
});
