/* Generic forms (export enquiry, contact, careers) → saved locally in 'inbox' + success note */
document.addEventListener('DOMContentLoaded', () => {
  RT.$$('form[data-form]').forEach(form => {
    const note = form.querySelector('.note'), kind = form.dataset.form; let file = null;
    const dz = form.querySelector('.drop'), fi = form.querySelector('input[type=file]');
    if (dz) {
      dz.addEventListener('click', () => fi.click());
      ['dragover', 'dragenter'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('over'); }));
      ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('over'); }));
      const set = f => { if (!f) return; file = f; dz.querySelector('b').textContent = '📄 ' + f.name; };
      dz.addEventListener('drop', e => set(e.dataTransfer.files[0])); fi.addEventListener('change', () => set(fi.files[0]));
    }
    form.addEventListener('submit', e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(form)); delete d.cv; if (file) d.cvName = file.name;
      if (dz && !file) { RT.toast('Please attach your CV first', '📎'); return; }
      const box = RT.store.get('inbox', []); box.push({ kind, ...d, at: new Date().toISOString() }); RT.store.set('inbox', box);
      form.reset(); file = null; if (dz) dz.querySelector('b').textContent = '📥 Click or drag your CV here';
      if (note) { note.classList.add('show'); setTimeout(() => note.classList.remove('show'), 6000); } RT.toast('Thank you! We will get back to you shortly.', '💛');
    });
  });
});
