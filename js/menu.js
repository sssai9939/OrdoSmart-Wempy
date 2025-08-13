// Menu page logic: load JSON, render, manage add-to-cart
const CART_KEY = 'wempyCart';

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}
function cartTotals(cart) {
  const items = cart.reduce((a, i) => a + i.qty, 0);
  const total = cart.reduce((a, i) => a + i.qty * i.unitPrice, 0);
  return { items, total };
}
function updateCartUI() {
  const cart = readCart();
  const { items, total } = cartTotals(cart);
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = String(items);
  const bar = document.getElementById('cart-summary');
  if (bar) bar.style.display = items > 0 ? 'block' : 'none';
  const infoItems = document.querySelector('.cart-items-count');
  const infoTotal = document.querySelector('.cart-total');
  if (infoItems) infoItems.textContent = items + ' عنصر';
  if (infoTotal) infoTotal.textContent = total.toFixed(2) + ' جنيه';
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Failed to load ' + path);
  return await res.json();
}

function createCard(item, category) {
  const card = document.createElement('div');
  card.className = 'menu-card';
  let priceText = item.price ? item.price : (item.size && item.size.length ? item.size[0].price : 0);
  // Handle ranges like "15-20" => take minimum
  if (typeof priceText === 'string' && priceText.includes('-')) {
    const parts = priceText.split('-').map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
    if (parts.length) priceText = Math.min(...parts);
  }
  const unitPrice = Number(priceText) || 0;
  const img = item.image || '';
  let optionsHtml = '';
  let basePrice = item.price;

  if (item.size && item.size.length > 0) {
    basePrice = item.size[0].price; // Default to first size's price
    optionsHtml = `<div class="options-group" data-id="${item.id}">`;
    optionsHtml += item.size.map((s, index) => `
      <label>
        <input type="radio" name="size-${item.id}" value="${s.price}" data-name="${s.name}" ${index === 0 ? 'checked' : ''}>
        ${s.name} (${s.price.toFixed(2)} جنيه)
      </label>
    `).join('');
    optionsHtml += `</div>`;
  } else if (item.type && item.type.length > 0) {
    optionsHtml = `<div class="options-group" data-id="${item.id}">`;
    optionsHtml += item.type.map((t, index) => `
      <label>
        <input type="radio" name="type-${item.id}" value="${t}" ${index === 0 ? 'checked' : ''}>
        ${t}
      </label>
    `).join('');
    optionsHtml += `</div>`;
  }

  const priceDisplay = isNaN(parseFloat(basePrice)) ? basePrice : `${parseFloat(basePrice).toFixed(2)} جنيه`;

  card.innerHTML = `
    <img src="${img}" alt="${item.title}">
    <div class="content">
      <div class="title">${item.title || ''}</div>
      <div class="desc">${item.description || ''}</div>
      ${optionsHtml}
      <div class="price">${priceDisplay}</div>
      <div class="controls">
        <div class="qty">
          <button class="minus" aria-label="decrease">-</button>
          <span class="value">0</span>
          <button class="plus" aria-label="increase">+</button>
        </div>
        <button class="add-btn">أضف للسلة</button>
      </div>
    </div>`;

  const minus = card.querySelector('.minus');
  const plus = card.querySelector('.plus');
  const value = card.querySelector('.value');
  const addBtn = card.querySelector('.add-btn');

  let qty = 0;
  minus.addEventListener('click', () => { qty = Math.max(0, qty - 1); value.textContent = String(qty); });
  plus.addEventListener('click', () => { qty += 1; value.textContent = String(qty); });

  addBtn.addEventListener('click', () => {
    if (qty <= 0) {
      alert("الرجاء تحديد الكمية أولاً.");
      return;
    }

    const cart = readCart();
    let finalPrice = unitPrice;
    let finalName = item.title;
    let cartItemId = item.id;

    const sizeSelector = card.querySelector(`input[name="size-${item.id}"]:checked`);
    if (sizeSelector) {
      finalPrice = parseFloat(sizeSelector.value);
      const sizeName = sizeSelector.dataset.name;
      finalName = `${item.title} (${sizeName})`;
      cartItemId = `${item.id}-${sizeName}`;
    }

    const typeSelector = card.querySelector(`input[name="type-${item.id}"]:checked`);
    if (typeSelector) {
      const typeName = typeSelector.value;
      finalName = `${item.title} (${typeName})`;
      cartItemId = `${item.id}-${typeName}`;
    }

    const existing = cart.find(i => i.id === cartItemId);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: cartItemId, name: finalName, unitPrice: finalPrice, qty, image: img, category });
    }

    writeCart(cart);
    qty = 0; value.textContent = '0';
    alert(`تمت إضافة ${qty}x ${finalName} إلى السلة.`);
  });

  // Add event listeners for radio buttons to update price
  card.querySelectorAll('.options-group input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const priceEl = card.querySelector('.price');
      if (e.target.name.startsWith('size-')) {
        const newPrice = parseFloat(e.target.value);
        priceEl.textContent = `${newPrice.toFixed(2)} جنيه`;
      }
    });
  });

  return card;
}

function renderList(list, containerId, category) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  list.forEach(item => container.appendChild(createCard(item, category)));
}

function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.category;
    document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    window.location.hash = target;
  }));
  if (location.hash) {
    const id = location.hash.replace('#','');
    const targetBtn = Array.from(tabs).find(b => b.dataset.category === id);
    if (targetBtn) targetBtn.click();
  }
}

async function initMenu() {
  updateCartUI();
  setupTabs();
  try {
    const [dishes, sandwiches, drinks] = await Promise.all([
      loadJSON('data/Dishes.json'),
      loadJSON('data/Sandwiches.json'),
      loadJSON('data/Drinks.json')
    ]);
    renderList(dishes, 'dishes-grid', 'dishes');
    renderList(sandwiches, 'sandwiches-grid', 'sandwiches');
    renderList(drinks, 'drinks-grid', 'drinks');
  } catch (e) {
    console.error('Error loading menu', e);
  }
}

document.addEventListener('DOMContentLoaded', initMenu);
