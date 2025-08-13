// Shared cart logic and cart page rendering
const CART_KEY = 'wempyCart';

function cartRead() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function cartWrite(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartHUD();
}
async function calculateTotals(cart){
  const subtotal = cart.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  let deliveryFee = 0;
  try {
      const deliveryData = await (await fetch('data/Delivery.json')).json();
      deliveryFee = deliveryData.price || 0;
  } catch (e) {
      console.error("Could not load delivery fee", e);
  }
  const total = subtotal + deliveryFee;
  return { subtotal, deliveryFee, total };
}
async function updateCartHUD(){
  const cart = cartRead();
  const {subtotal, deliveryFee, total} = await calculateTotals(cart);
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = String(cart.reduce((a,i)=>a+i.qty,0));
  const bar = document.getElementById('cart-summary');
  if (bar) bar.style.display = cart.length>0? 'block':'none';
  const infoItems = document.querySelector('.cart-items-count');
  const infoTotal = document.querySelector('.cart-total');
  if (infoItems) infoItems.textContent = cart.length + ' عنصر';
  if (infoTotal) infoTotal.textContent = total.toFixed(2) + ' جنيه';
}

async function renderCartPage(){
  const container = document.getElementById('cart-items');
  if (!container) return; // not on cart page
  const cart = cartRead();
  container.innerHTML = '';
  cart.forEach((item, idx)=>{
    const row = document.createElement('div');
    row.className='cart-row';
    row.innerHTML = `
      <img src="${item.image||''}" class="thumb" alt="${item.name}">
      <div class="info">
        <div class="name">${item.name}</div>
        <div class="price">${item.unitPrice.toFixed(2)} جنيه</div>
      </div>
      <div class="qty">
        <button class="minus">-</button>
        <span class="value">${item.qty}</span>
        <button class="plus">+</button>
      </div>
      <div class="line-total">${(item.qty*item.unitPrice).toFixed(2)} جنيه</div>
      <button class="remove">✕</button>
    `;
    const minus=row.querySelector('.minus');
    const plus=row.querySelector('.plus');
    const value=row.querySelector('.value');
    const remove=row.querySelector('.remove');
    const lineTotal=row.querySelector('.line-total');
    minus.addEventListener('click',()=>{
      item.qty=Math.max(0,item.qty-1);
      if(item.qty===0){ cart.splice(idx,1);} 
      value.textContent=String(item.qty);
      lineTotal.textContent=(item.qty*item.unitPrice).toFixed(2)+' جنيه';
      cartWrite(cart); renderCartPage();
    });
    plus.addEventListener('click',()=>{
      item.qty+=1; value.textContent=String(item.qty);
      lineTotal.textContent=(item.qty*item.unitPrice).toFixed(2)+' جنيه';
      cartWrite(cart); renderCartPage();
    });
    remove.addEventListener('click',()=>{
      cart.splice(idx,1); cartWrite(cart); renderCartPage();
    });
    container.appendChild(row);
  });
  const {subtotal, deliveryFee, total} = await calculateTotals(cart);
  const subtotalEl = document.getElementById('subtotal');
  if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2) + ' جنيه';
  const deliveryFeeEl = document.getElementById('delivery-fee');
  if (deliveryFeeEl) deliveryFeeEl.textContent = deliveryFee.toFixed(2) + ' جنيه';
  const grandEl = document.getElementById('grand');
  if (grandEl) grandEl.textContent = total.toFixed(2) + ' جنيه';
}

async function submitOrder(){
  const cart = cartRead();
  if (cart.length === 0) return alert('السلة فارغة');

  const customer = {
    name: document.getElementById('cust-name')?.value || 'غير محدد',
    phone: document.getElementById('cust-phone')?.value || 'غير محدد',
    address: document.getElementById('cust-address')?.value || 'غير محدد',
    notes: document.getElementById('cust-notes')?.value || ''
  };

  const { subtotal, deliveryFee, total } = await calculateTotals(cart);
  const payload = {
    items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.unitPrice })),
    customer: { name: customer.name, phone: customer.phone, address: customer.address, notes: customer.notes },
    totals: { subtotal, delivery: deliveryFee, total: total }
  };

  try {
    const response = await fetch('http://127.0.0.1:5000/submit_order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || 'فشل إرسال الطلب');
    }

    alert(`تم إرسال الطلب بنجاح! رقم الطلب: ${result.order_id}`);
    localStorage.removeItem(CART_KEY);
    window.location.href = 'menu.html';

  } catch (error) {
    console.error('Error submitting order:', error);
    alert(`حدث خطأ: ${error.message}\nيرجى التأكد من أن الخادم يعمل بشكل صحيح.`);
  }
}

async function initCartPage(){
  updateCartHUD();
  await renderCartPage();
  const btn = document.getElementById('submit-order');
  if (btn) btn.addEventListener('click', submitOrder);
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await updateCartHUD();
  if (document.getElementById('cart-items')) initCartPage();
});
