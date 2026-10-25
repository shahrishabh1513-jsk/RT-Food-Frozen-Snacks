RT.pdf = (() => {
  const Y = [255, 196, 0], INK = [38, 38, 38], RED = [255, 77, 46], MUTE = [110, 104, 90];
  const mk = () => { const { jsPDF } = window.jspdf; return new jsPDF({ unit: 'mm', format: 'a4' }); };
  const header = (d, title, sub) => {
    d.setFillColor(...Y); d.rect(0, 0, 210, 40, 'F'); d.setFillColor(...INK); d.rect(0, 40, 210, 3, 'F');
    const w = 52, h = w / RTFOOD_LOGO_RATIO; d.addImage(RTFOOD_LOGO, 'PNG', 210 - 14 - w, 20 - h / 2, w, h);   // logo: top-right
    d.setTextColor(...INK); d.setFont('helvetica', 'bold'); d.setFontSize(title.length > 26 ? 19 : 24); d.text(d.splitTextToSize(title, 125), 14, 19);
    d.setFont('helvetica', 'normal'); d.setFontSize(10); d.text(sub, 14, 34);
  };
  const footer = (d, txt) => { const n = d.getNumberOfPages(); for (let i = 1; i <= n; i++) { d.setPage(i); d.setDrawColor(...Y); d.setLineWidth(.8); d.line(14, 283, 196, 283); d.setFontSize(8); d.setTextColor(...MUTE); d.text(txt, 14, 289); d.text(`Page ${i} / ${n}`, 196, 289, { align: 'right' }); } };
  const stamp = new Date().toLocaleString('en-IN');

  function recipe(r) {
    const d = mk(); header(d, r.title, `${r.cat}  •  RT FOOD Recipe Card`);
    let y = 56; d.setTextColor(...INK);
    [['TIME', r.mins + ' min'], ['SERVES', r.serves + ''], ['MAIN RT FOOD PRODUCT', r.product]].forEach((m, i) => {
      const x = 14 + i * 62; d.setFillColor(255, 249, 227); d.roundedRect(x, y - 7, 58, 16, 3, 3, 'F'); d.setFontSize(7); d.setTextColor(...MUTE); d.setFont('helvetica', 'bold'); d.text(m[0], x + 4, y - 2); d.setFontSize(10.5); d.setTextColor(...INK); d.text(d.splitTextToSize(m[1], 50)[0], x + 4, y + 5);
    });
    y += 22; d.setFont('helvetica', 'bold'); d.setFontSize(15); d.setTextColor(...RED); d.text('Ingredients', 14, y); d.setDrawColor(...Y); d.setLineWidth(1.2); d.line(14, y + 2, 48, y + 2); y += 10;
    d.setFont('helvetica', 'normal'); d.setFontSize(11); d.setTextColor(...INK);
    r.ingredients.forEach(t => { const ls = d.splitTextToSize(t, 170); d.setDrawColor(...INK); d.setLineWidth(.4); d.rect(14, y - 3.4, 3.6, 3.6); d.text(ls, 21, y); y += ls.length * 5.4 + 2.2; });
    y += 6; d.setFont('helvetica', 'bold'); d.setFontSize(15); d.setTextColor(...RED); d.text('Cooking Process', 14, y); d.setDrawColor(...Y); d.setLineWidth(1.2); d.line(14, y + 2, 58, y + 2); y += 11;
    r.steps.forEach((t, i) => {
      const ls = d.splitTextToSize(t, 168), hgt = ls.length * 5.6; if (y + hgt > 270) { d.addPage(); y = 22; }
      d.setFillColor(...INK); d.circle(19, y - 1.6, 4.2, 'F'); d.setTextColor(...Y); d.setFont('helvetica', 'bold'); d.setFontSize(10); d.text(String(i + 1), 19, y, { align: 'center' });
      d.setTextColor(...INK); d.setFont('helvetica', 'normal'); d.setFontSize(11); d.text(ls, 27, y); y += hgt + 5;
    });
    if (y > 250) { d.addPage(); y = 22; }
    d.setFillColor(255, 249, 227); d.roundedRect(14, y + 2, 182, 20, 4, 4, 'F'); d.setFont('helvetica', 'bold'); d.setFontSize(10); d.setTextColor(...INK); d.text('Chef\'s tip', 20, y + 10);
    d.setFont('helvetica', 'normal'); d.setFontSize(9.5); d.text(d.splitTextToSize('Cook RT FOOD products straight from frozen — do not thaw. Fry at 175 °C, air-fry at 200 °C or bake at 220 °C until golden.', 140), 20, y + 16);
    d.setTextColor(...RED); d.setFontSize(9); d.textWithLink('Watch the video: youtu.be/' + r.id, 14, y + 32, { url: 'https://youtu.be/' + r.id });
    footer(d, 'RT FOOD – Frozen Snacks & French Fries  |  Downloaded ' + stamp); d.save(RT.slug(r.title) + '-rtfood-recipe.pdf');
  }

  function bill(o) {
    const d = mk(); header(d, 'TAX INVOICE', `Order No: ${o.id}   |   Date: ${new Date(o.createdAt).toLocaleString('en-IN')}`);
    let y = 56; d.setTextColor(...INK);
    const col = (x, h, lines) => { d.setFont('helvetica', 'bold'); d.setFontSize(9); d.setTextColor(...RED); d.text(h, x, y); d.setFont('helvetica', 'normal'); d.setFontSize(10.5); d.setTextColor(...INK); d.text(lines, x, y + 6); };
    col(14, 'BILLED TO', [o.customer.name, ...d.splitTextToSize(`${o.customer.address}, ${o.customer.city} - ${o.customer.pin}`, 88), 'Phone: ' + o.customer.phone, o.customer.email || '']);
    col(118, 'PAYMENT', ['Method: ' + ({ upi: 'UPI', card: 'Card', cod: 'Cash on Delivery' }[o.payment.method]), 'Status: ' + o.payment.status, 'RT FOOD, Ahmedabad', 'GSTIN: 24XXXXXXXXXXXZ5']);
    y += 38; d.setFillColor(...INK); d.rect(14, y, 182, 9, 'F'); d.setTextColor(...Y); d.setFont('helvetica', 'bold'); d.setFontSize(9.5);
    [['#', 17], ['Product', 24], ['Pack', 108], ['Qty', 128], ['Price', 158, 'r'], ['Amount', 194, 'r']].forEach(c => d.text(c[0], c[1], y + 6, c[2] ? { align: 'right' } : {}));
    y += 15; d.setFont('helvetica', 'normal'); d.setTextColor(...INK); d.setFontSize(10);
    o.items.forEach((it, i) => { if (y > 255) { d.addPage(); y = 25; } d.text(String(i + 1), 17, y); d.text(d.splitTextToSize(it.name, 80)[0], 24, y); d.text(it.size, 108, y); d.text(String(it.qty), 128, y); d.text('Rs. ' + it.unit.toLocaleString('en-IN'), 158, y, { align: 'right' }); d.text('Rs. ' + (it.unit * it.qty).toLocaleString('en-IN'), 194, y, { align: 'right' }); d.setDrawColor(235, 225, 180); d.line(14, y + 3, 196, y + 3); y += 8; });
    y += 4; if (y > 215) { d.addPage(); y = 25; }
    const t = o.totals, row = (l, v, b, c) => { d.setFont('helvetica', b ? 'bold' : 'normal'); d.setFontSize(b ? 13 : 10.5); d.setTextColor(...(c || INK)); d.text(l, 120, y); d.text(v, 194, y, { align: 'right' }); y += b ? 9 : 6.5; };
    const m = n => 'Rs. ' + n.toLocaleString('en-IN');
    row('Subtotal', m(t.sub)); if (t.discount) row(`Discount${t.coupon ? ' (' + t.coupon + ')' : ''}`, '- ' + m(t.discount), 0, [31, 169, 113]);
    row('Delivery', t.ship ? m(t.ship) : 'FREE'); row(`CGST @${RT.GST_RATE * 50}%`, m(Math.round(t.gst / 2))); row(`SGST @${RT.GST_RATE * 50}%`, m(t.gst - Math.round(t.gst / 2)));
    d.setFillColor(...Y); d.roundedRect(116, y - 2, 80, 12, 3, 3, 'F'); y += 6; row('GRAND TOTAL', m(t.total), 1);
    y = Math.max(y + 24, 232); if (y > 262) { d.addPage(); y = 60; }
    d.setFont('helvetica', 'normal'); d.setFontSize(9); d.setTextColor(...MUTE); d.text(['Thank you for ordering with RT FOOD!', 'Keep frozen at -18 °C. Goods once sold will be replaced only if damaged in transit.'], 14, y);
    d.setDrawColor(...INK); d.setLineWidth(.6); d.line(140, y + 10, 196, y + 10);                      // signature: scribble + line
    d.setLineWidth(.9); d.lines([[4, -9], [3, 9], [3, -7], [3, 7], [4, -6], [3, 5], [5, -4], [6, 3], [6, -2]], 146, y + 8, [1, 1], 'S');
    d.setFont('helvetica', 'bold'); d.setFontSize(9); d.setTextColor(...INK); d.text('Authorised Signatory', 168, y + 15, { align: 'center' }); d.setFont('helvetica', 'normal'); d.text('For RT FOOD', 168, y + 20, { align: 'center' });
    footer(d, 'RT FOOD – Frozen Snacks & French Fries  |  +91 78619 76128  |  about@hyfunfoods.com  |  Computer generated invoice'); d.save('RTFOOD-Invoice-' + o.id + '.pdf');
  }
  return { recipe, bill };
})();
