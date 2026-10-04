/* Shine zone - interactive layer. Loads after custom.js; no changes to your markup needed. */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const load = k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const inr = n => '\u20B9' + n.toLocaleString('en-IN');
  const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
  const el = (cls, tag) => { const e = document.createElement(tag || 'div'); e.className = cls; document.body.appendChild(e); return e; };

  let cart = load('sz_cart'), wish = load('sz_wish');

  /* ---------- Toasts ---------- */
  const toasts = el('sz-toasts');
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'sz-toast'; t.textContent = msg; toasts.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2400);
  }

  /* ---------- Cart drawer ---------- */
  const overlay = el('sz-overlay'), drawer = el('sz-drawer', 'aside');
  drawer.innerHTML = '<div class="sz-drawer-head"><h4>Your Cart</h4><button class="sz-x" aria-label="Close cart">&times;</button></div><div class="sz-items"></div><div class="sz-foot"></div>';
  const openCart = () => { drawer.classList.add('open'); overlay.classList.add('open'); };
  const closeAll = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); lightbox.classList.remove('open'); searchBar.classList.remove('open'); };

  function renderCart() {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    const total = cart.reduce((n, i) => n + i.qty * i.price, 0);
    $$('.cart_number').forEach(c => { c.textContent = count; c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
    $('.sz-items', drawer).innerHTML = cart.length ? cart.map((i, idx) =>
      '<div class="sz-item"><img src="' + esc(i.img) + '" alt=""><div class="sz-info"><strong>' + esc(i.name) + '</strong><span>' + inr(i.price) + '</span>' +
      '<div class="sz-qty"><button data-act="dec" data-i="' + idx + '">&minus;</button><b>' + i.qty + '</b><button data-act="inc" data-i="' + idx + '">+</button></div></div>' +
      '<button class="sz-rm" data-act="rm" data-i="' + idx + '" aria-label="Remove">&times;</button></div>').join('')
      : '<p class="sz-empty-cart">Your cart is empty.</p>';
    $('.sz-foot', drawer).innerHTML = cart.length
      ? '<div class="sz-total"><span>Total</span><strong>' + inr(total) + '</strong></div><button class="sz-btn" data-act="checkout">Checkout</button><button class="sz-link" data-act="clear">Clear cart</button>' : '';
    save('sz_cart', cart);
  }
  function addToCart(p) {
    const hit = cart.find(i => i.name === p.name);
    hit ? hit.qty++ : cart.push(Object.assign({ qty: 1 }, p));
    renderCart(); toast(p.name + ' added to cart');
  }
  drawer.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'), i = b && +b.dataset.i;
    if (e.target.closest('.sz-x')) return closeAll();
    if (!b) return;
    const a = b.dataset.act;
    if (a === 'inc') cart[i].qty++;
    else if (a === 'dec') { if (--cart[i].qty < 1) cart.splice(i, 1); }
    else if (a === 'rm') cart.splice(i, 1);
    else if (a === 'clear') cart = [];
    else if (a === 'checkout') { toast('Demo checkout - connect a payment/order backend to go live'); }
    renderCart();
  });
  overlay.addEventListener('click', closeAll);
  const cartLink = $('.quote_btn-container a');
  if (cartLink) cartLink.addEventListener('click', e => { e.preventDefault(); openCart(); });

  /* ---------- Products: buy, wishlist, sort ---------- */
  const boxes = $$('.price_container .box');
  boxes.forEach(b => {
    const nameEl = $('.name h6', b), priceEl = $('.detail-box h5 span', b);
    if (!nameEl || !priceEl) return;
    const name = nameEl.textContent.trim(), price = parseInt(priceEl.textContent.replace(/\D/g, ''), 10);
    const img = $('.img-box img', b), buy = $('.detail-box a', b);
    b.dataset.name = name.toLowerCase(); b.dataset.price = price;
    if (buy) buy.addEventListener('click', e => { e.preventDefault(); addToCart({ name, price, img: img ? img.getAttribute('src') : '' }); });
    const h = document.createElement('button');
    h.className = 'sz-heart' + (wish.includes(name) ? ' on' : ''); h.innerHTML = '&#10084;'; h.setAttribute('aria-label', 'Add to wishlist');
    h.addEventListener('click', () => {
      const on = h.classList.toggle('on');
      wish = on ? wish.concat(name) : wish.filter(w => w !== name);
      save('sz_wish', wish); toast(on ? 'Saved to wishlist' : 'Removed from wishlist');
    });
    b.appendChild(h);
  });

  const holder = boxes.length && boxes[0].parentNode;
  const empty = document.createElement('p'); empty.className = 'sz-empty'; empty.textContent = 'No jewellery matches your search.'; empty.style.display = 'none';
  if (holder) {
    const bar = document.createElement('div'); bar.className = 'sz-toolbar';
    bar.innerHTML = '<label>Sort by <select><option value="0">Featured</option><option value="1">Price: low to high</option><option value="2">Price: high to low</option></select></label>';
    holder.parentNode.insertBefore(bar, holder); holder.parentNode.insertBefore(empty, holder.nextSibling);
    $('select', bar).addEventListener('change', e => {
      const m = e.target.value, list = boxes.slice();
      if (m !== '0') list.sort((a, b) => (a.dataset.price - b.dataset.price) * (m === '1' ? 1 : -1));
      list.forEach(x => holder.appendChild(x));
    });
  }

  /* ---------- Search ---------- */
  const searchBar = el('sz-search');
  searchBar.innerHTML = '<input type="search" placeholder="Search jewellery (ring, necklace, earrings...)" aria-label="Search"><button class="sz-x" aria-label="Close search">&times;</button>';
  const sInput = $('input', searchBar);
  function runSearch() {
    const q = sInput.value.trim().toLowerCase(); let shown = 0;
    boxes.forEach(b => { const ok = !q || (b.dataset.name || '').includes(q); b.style.display = ok ? '' : 'none'; if (ok) shown++; });
    empty.style.display = shown || !boxes.length ? 'none' : 'block';
  }
  sInput.addEventListener('input', runSearch);
  sInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !boxes.length) location.href = 'jewellery.html?q=' + encodeURIComponent(sInput.value.trim());
  });
  $('.sz-x', searchBar).addEventListener('click', () => { sInput.value = ''; runSearch(); closeAll(); });
  $$('.nav_search-btn').forEach(b => b.addEventListener('click', e => {
    e.preventDefault(); searchBar.classList.toggle('open'); if (searchBar.classList.contains('open')) sInput.focus();
  }));
  const q0 = new URLSearchParams(location.search).get('q');
  if (q0) { sInput.value = q0; searchBar.classList.add('open'); runSearch(); }

  /* ---------- Image lightbox ---------- */
  const lightbox = el('sz-lightbox'); lightbox.innerHTML = '<img alt="">';
  document.addEventListener('click', e => {
    const img = e.target.closest('.price_container .img-box img, .item_container .img-box img, .about_section .img-box img');
    if (img) { $('img', lightbox).src = img.src; lightbox.classList.add('open'); }
  });
  lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  /* ---------- Form validation (contact + newsletter) ---------- */
  const mailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const rules = {
    name: v => !v ? 'Please enter your name' : /^\d+$/.test(v) ? 'Name cannot be only numbers' : '',
    email: v => !v ? 'Please enter your email' : mailOk(v) ? '' : 'Enter a valid email like name@example.com',
    phone: v => !v ? 'Please enter your phone number' : /^[6-9]\d{9}$/.test(v) ? '' : 'Enter a valid 10-digit mobile number',
    message: v => v.length < 5 ? 'Please write a short message' : ''
  };
  $$('.contact_section form').forEach(f => {
    f.removeAttribute('onsubmit');
    const keys = ['name', 'email', 'phone', 'message'];
    const fields = $$('input', f).slice(0, 4).map((inp, i) => {
      let err = inp.nextElementSibling;
      if (!err || err.tagName !== 'SPAN') { err = document.createElement('span'); inp.parentNode.appendChild(err); }
      err.className = 'sz-err';
      const check = () => { const m = rules[keys[i]](inp.value.trim()); err.textContent = m || '\u00a0'; inp.classList.toggle('sz-bad', !!m); return !m; };
      inp.addEventListener('blur', check);
      inp.addEventListener('input', () => { if (inp.classList.contains('sz-bad')) check(); });
      return { inp, check };
    });
    f.addEventListener('submit', e => {
      e.preventDefault();
      const bad = fields.filter(x => !x.check());
      if (bad.length) return bad[0].inp.focus();
      f.reset(); toast('Thanks! Your message has been sent.');
    });
  });
  $$('.info_form form').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const inp = $('input', f);
    if (!mailOk(inp.value.trim())) { inp.classList.add('sz-bad'); return toast('Please enter a valid email'); }
    inp.classList.remove('sz-bad'); f.reset(); toast('Subscribed! Welcome to Shine zone.');
  }));

  /* ---------- Page polish ---------- */
  const file = location.pathname.split('/').pop() || 'index.html';
  $$('.navbar-nav .nav-item').forEach(li => { const a = $('a', li); if (a) li.classList.toggle('active', a.getAttribute('href') === file); });
  const yr = $('#displayYear'); if (yr && !yr.textContent.trim()) yr.textContent = new Date().getFullYear();

  const header = $('.header_section'), top = el('sz-top', 'button');
  top.innerHTML = '&uarr;'; top.setAttribute('aria-label', 'Back to top');
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  addEventListener('scroll', () => {
    top.classList.toggle('show', scrollY > 400);
    if (header) header.classList.toggle('sz-scrolled', scrollY > 20);
  }, { passive: true });

  const targets = $$('.price_container .box, .item_container .box, .heading_container, .about_section .img-box, .about_section .detail-box, .info_section .row > div');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('sz-in'); io.unobserve(en.target); } }), { threshold: 0.12 });
    targets.forEach((t, i) => { t.classList.add('sz-reveal'); t.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(t); });
  }

  renderCart();
})();