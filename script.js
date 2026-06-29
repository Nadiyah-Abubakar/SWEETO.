/* ============================================================
   Sweeto – Enhanced Script
   Features: Navbar, Scroll-spy, Search, Swiper, Cart,
             Toast Notifications, Category Filter, Scroll Reveal,
             Stats Counter, Wishlist, Newsletter, Loader
   ============================================================ */

'use strict';

// ==================== LOADER ====================
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => { loader.style.display = 'none'; }, 700);
  }, 2000);
}

// ==================== HEADER & MOBILE NAV ====================
const menuBtn = document.getElementById('menu-bars');
const navbar = document.getElementById('navbar');
const header = document.getElementById('main-header');

if (menuBtn && navbar) {
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('fa-times');
    navbar.classList.toggle('active');
  });
}

// Scroll – close nav, scroll-spy, sticky header tint
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('header .navbar a');

window.addEventListener('scroll', () => {
  if (menuBtn) menuBtn.classList.remove('fa-times');
  if (navbar) navbar.classList.remove('active');

  // Sticky header tint
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }

  // Scroll-spy
  const scrollY = window.scrollY;
  sections.forEach(sec => {
    const top = sec.offsetTop - 160;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(a => a.classList.remove('active'));
      const target = document.querySelector(`header .navbar a[href*="${id}"]`);
      if (target) target.classList.add('active');
    }
  });
});

// ==================== SEARCH FORM ====================
const searchIcon = document.getElementById('search-icon');
const searchForm = document.getElementById('search-form');
const closeBtn = document.getElementById('close');
const searchBox = document.getElementById('search-box');
const searchResults = document.getElementById('search-results');

function openSearch() {
  if (searchForm) {
    searchForm.classList.add('active');
    setTimeout(() => searchBox && searchBox.focus(), 350);
  }
}

function closeSearch() {
  if (searchForm) searchForm.classList.remove('active');
  if (searchResults) { searchResults.classList.remove('has-results'); searchResults.innerHTML = ''; }
  if (searchBox) searchBox.value = '';
}

if (searchIcon) searchIcon.addEventListener('click', openSearch);
if (closeBtn) closeBtn.addEventListener('click', closeSearch);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSearch();
});

// ----- Build searchable index from all product cards -----
function buildSearchIndex() {
  const index = [];
  const cards = document.querySelectorAll(
    '.desserts .box-container .box, .menu .box-container .box'
  );
  cards.forEach(card => {
    const nameEl = card.querySelector('h3');
    const descEl = card.querySelector('p');
    const priceEl = card.querySelector('.price-tag span, .price');
    const imgEl = card.querySelector('img');

    if (!nameEl) return;

    const section = card.closest('.desserts') ? 'desserts' : 'menu';
    index.push({
      name: nameEl.textContent.trim(),
      desc: descEl ? descEl.textContent.trim() : '',
      price: priceEl ? priceEl.textContent.trim() : '',
      img: imgEl ? imgEl.getAttribute('src') : '',
      section,
      card,
    });
  });
  return index;
}

let searchIndex = [];
window.addEventListener('DOMContentLoaded', () => { searchIndex = buildSearchIndex(); });

// ----- Highlight matching substring -----
function highlight(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

// ----- Render results -----
function renderResults(matches, query) {
  if (!searchResults) return;

  if (matches.length === 0) {
    searchResults.innerHTML = `<div class="search-no-results"><i class="fas fa-cookie" style="font-size:2.5rem;margin-bottom:.8rem;display:block;opacity:.4;"></i>No results for "<strong>${query}</strong>"</div>`;
    searchResults.classList.add('has-results');
    return;
  }

  searchResults.innerHTML = matches.map((m, i) => `
        <div class="search-result-item" tabindex="0" data-idx="${i}" role="option">
            <img src="${m.img}" alt="${m.name}" onerror="this.src='menu2.jpg'">
            <div class="search-result-info">
                <div class="res-name">${highlight(m.name, query)}</div>
                <div class="res-meta">${m.section} &bull; ${m.desc ? m.desc.slice(0, 55) + (m.desc.length > 55 ? '\u2026' : '') : ''}</div>
            </div>
            ${m.price ? `<span class="search-result-price">${m.price}</span>` : ''}
        </div>`).join('');

  searchResults.classList.add('has-results');

  // Click / keyboard: jump to matching card
  searchResults.querySelectorAll('.search-result-item').forEach((el, i) => {
    const jump = () => {
      closeSearch();
      const target = matches[i].card;
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.style.outline = '3px solid var(--primary)';
        target.style.outlineOffset = '4px';
        setTimeout(() => { target.style.outline = ''; target.style.outlineOffset = ''; }, 1800);
      }, 350);
    };
    el.addEventListener('click', jump);
    el.addEventListener('keydown', e => { if (e.key === 'Enter') jump(); });
  });
}

// ----- Live search on every keystroke -----
if (searchBox) {
  searchBox.addEventListener('input', () => {
    const query = searchBox.value.trim().toLowerCase();
    if (!query) {
      if (searchResults) { searchResults.classList.remove('has-results'); searchResults.innerHTML = ''; }
      return;
    }
    if (!searchIndex.length) searchIndex = buildSearchIndex();
    const matches = searchIndex.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.desc.toLowerCase().includes(query) ||
      m.section.toLowerCase().includes(query)
    );
    renderResults(matches, query);
  });

  // Arrow-down from box moves focus into results list
  searchBox.addEventListener('keydown', e => {
    if (!searchResults) return;
    const items = searchResults.querySelectorAll('.search-result-item');
    if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); items[0].focus(); }
  });
}

// Arrow-key nav through result items
if (searchResults) {
  searchResults.addEventListener('keydown', e => {
    const items = [...searchResults.querySelectorAll('.search-result-item')];
    const idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' && idx < items.length - 1) { e.preventDefault(); items[idx + 1].focus(); }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx === 0) searchBox && searchBox.focus();
      else items[idx - 1].focus();
    }
  });
}



// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, icon = 'fa-check-circle') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3100);
}

// ==================== CART STATE ====================
let cart = JSON.parse(localStorage.getItem('sweetoCart')) || [];

function saveCart() {
  localStorage.setItem('sweetoCart', JSON.stringify(cart));
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ==================== CART UI & WISHLIST UI ====================
// --- Cart Elements ---
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartBadge = document.getElementById('cart-badge');
const cartItemsEl = document.getElementById('cart-items');
const cartFooter = document.getElementById('cart-footer');
const cartTotal = document.getElementById('cart-total-price');
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('close-cart');

// --- Wishlist Elements ---
const wishlistSidebar = document.getElementById('wishlist-sidebar');
const wishlistBadge = document.getElementById('wishlist-badge');
const wishlistItemsEl = document.getElementById('wishlist-items');
const openWishlistBtn = document.getElementById('open-wishlist');
const closeWishlistBtn = document.getElementById('close-wishlist');

function openCart() {
  if (cartSidebar) cartSidebar.classList.add('active');
  if (cartOverlay) cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  if (cartSidebar) cartSidebar.classList.remove('active');
  if (wishlistSidebar) wishlistSidebar.classList.remove('active');
  if (cartOverlay) cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

function openWishlist() {
  if (wishlistSidebar) wishlistSidebar.classList.add('active');
  if (cartOverlay) cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

if (openCartBtn) openCartBtn.addEventListener('click', e => { e.preventDefault(); openCart(); });
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);

if (openWishlistBtn) openWishlistBtn.addEventListener('click', e => { e.preventDefault(); openWishlist(); });
if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', closeCart);

if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

function updateCartBadge() {
  const count = getCartCount();
  if (cartBadge) {
    cartBadge.textContent = count;
    cartBadge.classList.remove('bump');
    void cartBadge.offsetWidth; // reflow
    if (count > 0) cartBadge.classList.add('bump');
  }
}

function renderCart() {
  if (!cartItemsEl) return;

  updateCartBadge();

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
          <div class="cart-empty">
            <i class="fas fa-cookie-bite"></i>
            <p>Your cart is empty.<br>Start adding some sweet treats!</p>
          </div>`;
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }

  if (cartFooter) cartFooter.style.display = 'block';
  if (cartTotal) cartTotal.textContent = `$${getCartTotal().toFixed(2)}`;

  cartItemsEl.innerHTML = cart.map((item, idx) => `
      <div class="cart-item" data-idx="${idx}">
        <img src="${item.img}" alt="${item.name}" onerror="this.src='menu2.jpg'">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="price">$${(item.price * item.qty).toFixed(2)}</span>
          <div class="cart-item-controls">
            <button class="qty-btn" data-action="dec" data-idx="${idx}">−</button>
            <span class="qty-display">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-idx="${idx}">+</button>
          </div>
        </div>
        <button class="remove-item" data-idx="${idx}" aria-label="Remove item"><i class="fas fa-trash-alt"></i></button>
      </div>`).join('');

  // Qty & remove listeners
  cartItemsEl.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const action = btn.dataset.action;
      if (action === 'inc') cart[idx].qty++;
      else if (action === 'dec') {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      }
      saveCart();
      renderCart();
    });
  });

  cartItemsEl.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const name = cart[idx].name;
      cart.splice(idx, 1);
      saveCart();
      renderCart();
      showToast(`"${name}" removed from cart`, 'fa-trash-alt');
    });
  });
}

// ==================== ADD TO CART ====================
function addToCart(name, price, img) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price: parseFloat(price), img, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(`"${name}" added to cart! 🍰`, 'fa-shopping-bag');
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.add-to-cart');
  if (!btn) return;
  e.preventDefault();
  const { name, price, img } = btn.dataset;
  addToCart(name, price, img);
});

// ==================== WISHLIST TOGGLE & STATE ====================
let wishlist = JSON.parse(localStorage.getItem('sweetoWishlist')) || [];

function saveWishlist() {
  localStorage.setItem('sweetoWishlist', JSON.stringify(wishlist));
}

// Restore wishlist state on load
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.box').forEach(box => {
    const nameEl = box.querySelector('h3');
    if (!nameEl) return;
    const itemName = nameEl.textContent.trim();
    if (wishlist.includes(itemName)) {
      const heart = box.querySelector('.fa-heart');
      if (heart) heart.classList.add('liked');
    }
  });
  renderWishlist();
});

function updateWishlistBadge() {
  if (wishlistBadge) {
    wishlistBadge.textContent = wishlist.length;
    wishlistBadge.classList.remove('bump');
    void wishlistBadge.offsetWidth; // reflow
    if (wishlist.length > 0) wishlistBadge.classList.add('bump');
  }
}

function renderWishlist() {
  if (!wishlistItemsEl) return;
  updateWishlistBadge();

  if (wishlist.length === 0) {
    wishlistItemsEl.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-heart-broken"></i>
          <p>Your wishlist is empty.<br>Save your favorite treats for later!</p>
        </div>`;
    return;
  }

  // Build wishlist items by finding matching DOM cards
  const allBoxes = document.querySelectorAll('.box');
  let html = '';

  wishlist.forEach((wishName, idx) => {
    let matchingBox = Array.from(allBoxes).find(b => {
      let h3 = b.querySelector('h3');
      return h3 && h3.textContent.trim() === wishName;
    });

    if (matchingBox) {
      const priceEl = matchingBox.querySelector('.price-tag span, .price');
      const imgEl = matchingBox.querySelector('img');
      const price = priceEl ? priceEl.textContent.trim() : '';
      const img = imgEl ? imgEl.getAttribute('src') : '';
      html += `
        <div class="cart-item" data-idx="${idx}">
          <img src="${img}" alt="${wishName}" onerror="this.src='menu2.jpg'">
          <div class="cart-item-info">
            <h4>${wishName}</h4>
            <span class="price">${price}</span>
            <div class="cart-item-controls" style="margin-top: .8rem;">
              <button class="btn add-to-cart" style="font-size: 1.2rem; padding: .5rem 1.5rem; margin-top:0;" data-name="${wishName}" data-price="${price.replace('$', '')}" data-img="${img}">Move to Cart</button>
            </div>
          </div>
          <button class="remove-wishlist-item" data-name="${wishName}" aria-label="Remove item"><i class="fas fa-trash-alt"></i></button>
        </div>`;
    }
  });

  wishlistItemsEl.innerHTML = html;

  // Wire up remove buttons
  wishlistItemsEl.querySelectorAll('.remove-wishlist-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      wishlist = wishlist.filter(n => n !== name);
      saveWishlist();
      renderWishlist();

      // Un-heart on page
      document.querySelectorAll('.box').forEach(box => {
        const h3 = box.querySelector('h3');
        if (h3 && h3.textContent.trim() === name) {
          const heart = box.querySelector('.fa-heart');
          if (heart) heart.classList.remove('liked');
        }
      });
      showToast(`"${name}" removed from wishlist`, 'fa-trash-alt');
    });
  });
}

document.addEventListener('click', e => {
  // 1. WISHLIST TOGGLE (heart icon click)
  const heart = e.target.closest('.fa-heart:not(#open-wishlist)');
  if (heart) {
    e.preventDefault();
    const box = heart.closest('.box');
    const nameEl = box ? box.querySelector('h3') : null;
    const itemName = nameEl ? nameEl.textContent.trim() : 'Item';

    heart.classList.toggle('liked');

    if (heart.classList.contains('liked')) {
      if (!wishlist.includes(itemName)) {
        wishlist.push(itemName);
        saveWishlist();
      }
      showToast(`"${itemName}" added to wishlist ❤️`, 'fa-heart');
    } else {
      wishlist = wishlist.filter(name => name !== itemName);
      saveWishlist();
      showToast(`"${itemName}" removed from wishlist`, 'fa-heart-broken');
    }
    renderWishlist();
    return;
  }

  // 2. QUICK VIEW MODAL (eye icon click)
  const eye = e.target.closest('.fa-eye');
  if (eye) {
    e.preventDefault();
    const box = eye.closest('.box');
    if (!box) return;

    const nameEl = box.querySelector('h3');
    const descEl = box.querySelector('p');
    const priceEl = box.querySelector('.price-tag span, .price');
    const imgEl = box.querySelector('img');

    const name = nameEl ? nameEl.textContent.trim() : '';
    const desc = descEl ? descEl.textContent.trim() : 'Delicious sweet treat freshly baked for you.';
    const priceStr = priceEl ? priceEl.textContent.trim() : '';
    const img = imgEl ? imgEl.getAttribute('src') : '';
    const priceNum = priceStr.replace('$', '');

    const modal = document.getElementById('quick-view-modal');
    if (modal) {
      document.getElementById('qv-img').src = img;
      document.getElementById('qv-title').textContent = name;
      document.getElementById('qv-desc').textContent = desc;
      document.getElementById('qv-price').textContent = priceStr;

      const btn = document.getElementById('qv-add-btn');
      btn.dataset.name = name;
      btn.dataset.price = priceNum;
      btn.dataset.img = img;

      modal.classList.add('active');
    }
    return;
  }
});

// Close Quick View Modal & Checkout Modal
document.addEventListener('click', e => {
  if (e.target.id === 'quick-view-modal' || e.target.id === 'close-quick-view') {
    const qvModal = document.getElementById('quick-view-modal');
    if (qvModal) qvModal.classList.remove('active');
  }

  if (e.target.id === 'checkout-modal' || e.target.id === 'close-checkout') {
    const chkModal = document.getElementById('checkout-modal');
    if (chkModal) chkModal.classList.remove('active');
  }
});

// ==================== CHECKOUT LOGIC ====================
const openCheckoutBtn = document.getElementById('open-checkout');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutItemsEl = document.getElementById('checkout-items');
const checkoutTotalPrice = document.getElementById('checkout-total-price');
const secureCheckoutForm = document.getElementById('secure-checkout-form');

if (openCheckoutBtn) {
  openCheckoutBtn.addEventListener('click', e => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Your cart is empty!', 'fa-exclamation-circle');
      return;
    }

    closeCart(); // close the sidebar
    renderCheckout();
    if (checkoutModal) checkoutModal.classList.add('active');
  });
}

function renderCheckout() {
  if (!checkoutItemsEl) return;

  checkoutItemsEl.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <div class="checkout-item-name">${item.qty}x <span>${item.name}</span></div>
      <div class="checkout-item-price">$${(item.price * item.qty).toFixed(2)}</div>
    </div>
  `).join('');

  if (checkoutTotalPrice) {
    checkoutTotalPrice.textContent = `$${getCartTotal().toFixed(2)}`;
  }
}

if (secureCheckoutForm) {
  secureCheckoutForm.addEventListener('submit', e => {
    e.preventDefault();

    // Simulate payment processing
    const btn = secureCheckoutForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    setTimeout(() => {
      // Clear cart
      cart = [];
      saveCart();
      renderCart();

      // Reset form and close modal
      secureCheckoutForm.reset();
      btn.innerHTML = originalText;
      btn.disabled = false;
      if (checkoutModal) checkoutModal.classList.remove('active');

      // Success Notification
      showToast('Order Placed Successfully! 🎉', 'fa-check-circle');
    }, 1500);
  });
}


// ==================== CATEGORY FILTER ====================
const filterTabs = document.querySelectorAll('.filter-tab');
const dessertBoxes = document.querySelectorAll('.desserts .box-container .box');

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const filter = tab.dataset.filter;
    dessertBoxes.forEach(box => {
      if (filter === 'all' || box.dataset.category === filter) {
        box.style.display = '';
        box.style.animation = 'filterIn 0.4s ease both';
      } else {
        box.style.display = 'none';
      }
    });
  });
});

// Inject filter animation
const filterStyle = document.createElement('style');
filterStyle.textContent = `@keyframes filterIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }`;
document.head.appendChild(filterStyle);

// ==================== SCROLL REVEAL ====================
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
}

// ==================== NEWSLETTER ====================
const nlBtn = document.getElementById('nl-subscribe');
const nlEmail = document.getElementById('nl-email');

if (nlBtn && nlEmail) {
  nlBtn.addEventListener('click', () => {
    const email = nlEmail.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'fa-exclamation-circle');
      nlEmail.focus();
      return;
    }
    showToast('Subscribed! 🎉 Welcome to the Sweeto family!', 'fa-check-circle');
    nlEmail.value = '';
  });
}

// ==================== ORDER FORM ====================
const orderForm = document.getElementById('order-form');
if (orderForm) {
  orderForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('order-name')?.value.trim();
    const phone = document.getElementById('order-phone')?.value.trim();
    const item = document.getElementById('order-item')?.value.trim();

    if (!name || !phone || !item) {
      showToast('Please fill in all required fields.', 'fa-exclamation-circle');
      return;
    }
    showToast('Order placed successfully! 🎂 We\'ll confirm shortly.', 'fa-check-circle');
    orderForm.reset();
  });
}

// ==================== SWIPERS ====================
const homeSwiper = new Swiper('.home-slider', {
  spaceBetween: 0,
  centeredSlides: true,
  effect: 'fade',
  fadeEffect: { crossFade: true },
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  loop: true,
  speed: 900,
});

const reviewSwiper = new Swiper('.review-slider', {
  spaceBetween: 25,
  centeredSlides: false,
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
  loop: true,
  speed: 700,
  breakpoints: {
    0: { slidesPerView: 1 },
    640: { slidesPerView: 2 },
    1024: { slidesPerView: 3 },
  },
});

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  renderCart();
  initScrollReveal();
  initStatsCounter();
});
