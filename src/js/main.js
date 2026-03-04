import CartManager from './modules/CartManager.js';
import WhatsAppService from './services/WhatsAppService.js';

const menu = document.getElementById('menu');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cartCounter = document.getElementById('cart-count');
const addressInput = document.getElementById('address');
const addressWarn = document.getElementById('address-warn');
const observationInput = document.getElementById('observation');
const observationContainer = document.getElementById('observation-container');
const addObservationBtn = document.getElementById('add-observation-btn');
const addressContainer = document.getElementById('address-container');
const deliveryOptions = document.getElementsByName('delivery-option');
const footerBar = document.getElementById('footer-bar');

const cartManager = new CartManager();
const whatsAppService = new WhatsAppService();

// abre o modal e esconde o footer
cartBtn.addEventListener('click', () => {
    updateCartModal();
    cartModal.classList.add('lc-modal-overlay--open');
    adjustCartModalHeight();
    _setFooterVisible(false);
});

cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) _closeModal();
});

closeModalBtn.addEventListener('click', () => _closeModal());

function _closeModal() {
    cartModal.classList.remove('lc-modal-overlay--open');
    _setFooterVisible(true);
}

function _setFooterVisible(visible) {
    footerBar.classList.toggle('hidden-footer', !visible);
}

// ── Nav categorias ───────────────────────────────────────────────────
const _sections = [
    'sec-fs', 'sec-tradicionais', 'sec-especiais', 'sec-salgados',
    'sec-sucos', 'sec-vitaminas', 'sec-salada', 'sec-nordestina',
    'sec-tapiocas', 'sec-bebidas'
];

document.getElementById('category-nav').addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-btn[data-target]');
    if (!btn) return;
    document.querySelectorAll('.cat-btn[data-target]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    scrollToSection(btn.getAttribute('data-target'));
});

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    _scrolling = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { _scrolling = false; }, 800);
}

// destaca o botão da categoria visível na tela
let _scrolling = false;
const navContainer = document.querySelector('.lc-nav'); // CORREÇÃO: Pega o container scrollável

const _observer = new IntersectionObserver((entries) => {
    if (_scrolling) return;
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const catBtns = document.querySelectorAll('.cat-btn[data-target]');
        catBtns.forEach((btn, i) => {
            btn.classList.toggle('active', _sections[i] === entry.target.id);
        });

        // CORREÇÃO CRÍTICA: Substituído o scrollIntoView() por rolagem matemática via scrollLeft. 
        // Isso impede o navegador de "roubar" o scroll da página e travar tudo.
        const activeBtn = document.querySelector('.cat-btn[data-target].active');
        if (activeBtn && navContainer) {
            const scrollPos = activeBtn.offsetLeft - (navContainer.clientWidth / 2) + (activeBtn.clientWidth / 2);
            navContainer.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
    });
}, { rootMargin: '-20% 0px -70% 0px' });

_sections.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) _observer.observe(el);
});

// atualiza visual do botão carrinho + contador animado + háptico
function _updateFooterState() {
    const total = cartManager.getTotalItems();

    cartBtn.classList.toggle('cart-empty', total === 0);
    cartBtn.classList.toggle('cart-has-items', total > 0);

    cartCounter.textContent = total;
    cartCounter.classList.remove('pop');
    void cartCounter.offsetWidth; 
    cartCounter.classList.add('pop');

    if (total > 0 && navigator.vibrate) navigator.vibrate(25);
}

// adiciona item pelo menu + toast de confirmação
menu.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;

    const name = btn.getAttribute('data-name');
    const price = parseFloat(btn.getAttribute('data-price'));

    cartManager.addItem(name, price);
    updateCartModal();

    Toastify({
        text: `✓ ${name} adicionado`,
        duration: 1500,
        gravity: 'bottom',
        position: 'center',
        stopOnFocus: false,
        style: {
            background: 'rgba(30,30,30,0.95)',
            border: '1px solid rgba(250,204,21,0.25)',
            color: '#facc15',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '.85rem',
            fontWeight: '500',
            borderRadius: '12px',
            padding: '10px 20px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
            marginBottom: '80px'
        }
    }).showToast();
});

function updateCartModal() {
    cartItemsContainer.innerHTML = '';
    const cart = cartManager.getCart();
    const total = cartManager.getTotal();
    const lastOrder = cartManager.getLastOrder();

    if (cart.length === 0) {
        let repeatBtn = '';

        if (lastOrder?.cart?.length > 0) {
            const date = new Date(lastOrder.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            const value = lastOrder.cart
                .reduce((s, i) => s + i.price * i.quantity, 0)
                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            repeatBtn = `
            <div style="padding:0 0 8px;">
              <button id="repeat-order-btn"
                style="background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);border-radius:12px;padding:11px 20px;color:#facc15;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;width:100%;transition:background .2s;">
                🔄 Repetir pedido de ${date} · ${value}
              </button>
            </div>`;
        }

        cartItemsContainer.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:36px 20px 24px;gap:10px;opacity:.5;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <p style="font-family:'DM Sans',sans-serif;font-size:.9rem;color:rgba(255,255,255,0.4);text-align:center;margin:0;">
            Seu carrinho está vazio<br>
            <span style="font-size:.78rem;">Adicione algo do menu 😊</span>
          </p>
        </div>
        ${repeatBtn}`;

    } else {
        cart.forEach((item, index) => {
            const el = document.createElement('div');
            el.style.cssText = `display:flex;align-items:flex-start;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.06);animation:lcFadeUp .3s cubic-bezier(0.22,1,0.36,1) ${index * 60}ms both;gap:8px;`;

            const noteLabel = item.note
                ? `📝 ${item.note.length > 22 ? item.note.slice(0, 22) + '…' : item.note}`
                : '+ obs.';

            el.innerHTML = `
            <div style="flex:1;min-width:0;">
              <p style="font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;color:#fff;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_escapeHtml(item.name)}</p>
              <p style="font-family:'DM Sans',sans-serif;font-size:.75rem;color:rgba(255,255,255,0.3);margin:2px 0 4px;">R$ ${item.price.toFixed(2)} cada</p>
              <button class="toggle-note-btn" data-index="${index}" data-name="${_escapeHtml(item.name)}">${noteLabel}</button>
              <input class="item-note-input" data-index="${index}" data-name="${_escapeHtml(item.name)}"
                style="display:${item.note ? 'block' : 'none'};"
                placeholder="Obs. para este item..." maxlength="120" />
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;padding-top:2px;">
              <button class="remove-from-cart-btn btn-minus"
                data-name="${_escapeHtml(item.name)}"
                style="width:32px;height:32px;border-radius:50%;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);color:#f87171;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;">−</button>
              <span style="font-family:'DM Sans',sans-serif;font-weight:700;color:#fff;font-size:.95rem;min-width:16px;text-align:center;">${item.quantity}</span>
              <button class="add-from-cart-btn btn-plus"
                data-name="${_escapeHtml(item.name)}" data-price="${item.price}"
                style="width:32px;height:32px;border-radius:50%;background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.2);color:#facc15;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;">+</button>
              <span style="font-family:'DM Sans',sans-serif;font-weight:700;color:#facc15;font-size:.9rem;min-width:52px;text-align:right;">R$ ${(item.price * item.quantity).toFixed(2)}</span>
            </div>`;

            el.querySelector('.item-note-input').value = item.note || '';
            cartItemsContainer.appendChild(el);
        });
    }

    cartTotal.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    _updateFooterState();
}

// cliques dentro do carrinho
cartItemsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const name = btn.getAttribute('data-name');

    if (btn.classList.contains('remove-from-cart-btn')) {
        cartManager.removeItem(name);
        updateCartModal();
        return;
    }

    if (btn.classList.contains('add-from-cart-btn')) {
        cartManager.addItem(name, parseFloat(btn.getAttribute('data-price')));
        updateCartModal();
        return;
    }

    if (btn.classList.contains('toggle-note-btn')) {
        const input = cartItemsContainer.querySelector(`.item-note-input[data-index="${btn.getAttribute('data-index')}"]`);
        if (input) {
            const visible = input.style.display !== 'none';
            input.style.display = visible ? 'none' : 'block';
            if (!visible) input.focus();
        }
        return;
    }

    if (btn.id === 'repeat-order-btn') {
        _repeatLastOrder();
        return;
    }
});

// salva nota em tempo real
cartItemsContainer.addEventListener('input', (e) => {
    const input = e.target.closest('.item-note-input');
    if (!input) return;

    const name = input.getAttribute('data-name');
    const index = input.getAttribute('data-index');
    cartManager.setItemNote(name, input.value);

    const toggleBtn = cartItemsContainer.querySelector(`.toggle-note-btn[data-index="${index}"]`);
    if (toggleBtn) {
        const note = input.value;
        toggleBtn.textContent = note
            ? `📝 ${note.length > 22 ? note.slice(0, 22) + '…' : note}`
            : '+ obs.';
    }
});

function _repeatLastOrder() {
    const lastOrder = cartManager.getLastOrder();
    if (!lastOrder) return;

    cartManager.loadCart(lastOrder.cart);

    const radio = document.querySelector(`input[name="delivery-option"][value="${lastOrder.deliveryOption}"]`);
    if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
    }

    addressInput.value = lastOrder.address || '';

    if (lastOrder.observation) {
        observationInput.value = lastOrder.observation;
        observationContainer.classList.add('obs-visible');
        addObservationBtn.textContent = '− Remover observação';
    }

    updateCartModal();
}

addressInput.addEventListener('input', () => {
    if (addressInput.value.trim() !== '') {
        addressInput.classList.remove('border-red-500');
        addressWarn.classList.add('hidden');
    }
});

Array.from(deliveryOptions).forEach(option => {
    option.addEventListener('change', function () {
        const deliveryPill = document.querySelector('.delivery-pill');
        const pickupPill   = document.querySelector('.pickup-pill');
        const isDelivery   = this.value === 'delivery';

        deliveryPill.classList.toggle('pill-active',   isDelivery);
        deliveryPill.classList.toggle('pill-inactive', !isDelivery);
        pickupPill.classList.toggle('pill-active',    !isDelivery);
        pickupPill.classList.toggle('pill-inactive',   isDelivery);

        if (isDelivery) {
            addressContainer.classList.add('addr-open');
        } else {
            addressContainer.classList.remove('addr-open');
        }
    });
});

checkoutBtn.addEventListener('click', () => {
    if (!checkRestalrantOpen()) {
        Toastify({
            text: 'O Restaurante está fechado!',
            duration: 3000,
            close: true,
            gravity: 'top',
            position: 'center',
            stopOnFocus: true,
            style: { background: 'linear-gradient(to right, #7c1c1c, #120504)' }
        }).showToast();
        return;
    }

    const cart = cartManager.getCart();
    if (cart.length === 0) return;

    const deliveryOption = document.querySelector('input[name="delivery-option"]:checked').value;
    const address = addressInput.value.trim();
    const observation = observationInput.value.trim();

    if (deliveryOption === 'delivery' && address === '') {
        addressWarn.classList.remove('hidden');
        addressInput.classList.add('border-red-500');
        addressInput.focus();
        return;
    }

    cartManager.saveLastOrder(cart, deliveryOption, address, observation);
    whatsAppService.sendOrder(cart, deliveryOption, address, observation);

    cartManager.clear();
    observationInput.value = '';
    observationContainer.classList.remove('obs-visible');
    addObservationBtn.textContent = '+ Adicionar observação';
    addressInput.value = '';
    _closeModal();
    updateCartModal();
});

function checkRestalrantOpen() {
    return true; 
}

const spanItem = document.getElementById('date-span');
if (spanItem) {
    if (checkRestalrantOpen()) {
        spanItem.style.cssText = 'display:inline-flex;align-items:center;gap:8px;background:rgba(22,163,74,0.15);border:1px solid rgba(22,163,74,0.35);padding:8px 20px;border-radius:9999px;margin-top:4px;';
        spanItem.innerHTML = `
        <span style="width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;box-shadow:0 0 8px #4ade80;animation:lcPulse 1.5s ease infinite;"></span>
        <span style="font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:500;color:#4ade80;">Aberto agora</span>
        <span style="width:1px;height:12px;background:rgba(255,255,255,0.15);display:inline-block;"></span>
        <span style="font-family:'DM Sans',sans-serif;font-size:.8rem;color:rgba(255,255,255,0.4);">Seg–Sáb · 7h às 17h</span>`;
    } else {
        spanItem.style.cssText = 'display:inline-flex;align-items:center;gap:8px;background:rgba(153,27,27,0.2);border:1px solid rgba(153,27,27,0.4);padding:8px 20px;border-radius:9999px;margin-top:4px;';
        spanItem.innerHTML = `
        <span style="width:7px;height:7px;border-radius:50%;background:#f87171;display:inline-block;"></span>
        <span style="font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:500;color:#f87171;">Fechado agora</span>
        <span style="width:1px;height:12px;background:rgba(255,255,255,0.15);display:inline-block;"></span>
        <span style="font-family:'DM Sans',sans-serif;font-size:.8rem;color:rgba(255,255,255,0.4);">Abre Seg–Sáb às 7h</span>`;
    }
}

function adjustCartModalHeight() {
    cartModal.style.maxHeight = window.innerHeight + 'px';
}

addObservationBtn.addEventListener('click', () => {
    const isOpen = observationContainer.classList.toggle('obs-visible');
    addObservationBtn.textContent = isOpen ? '− Remover observação' : '+ Adicionar observação';
});

function _escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

_updateFooterState();

/*=============== VOLTAR AO TOPO ===============*/
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/*=============== BUSCA ===============*/
const searchInput   = document.getElementById('search-input');
const searchToggle  = document.getElementById('search-toggle');
const searchClose   = document.getElementById('search-close');
const searchOverlay = document.getElementById('search-overlay');
const noResults     = document.getElementById('no-results');

const _cardCache = new Map();

function _highlight(html, q) {
    if (!q) return html;
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return html.replace(
        new RegExp(`(${safe})`, 'gi'),
        '<mark style="background:rgba(249,115,22,.2);color:inherit;border-radius:2px;padding:0 1px;font-weight:600">$1</mark>'
    );
}

function _runSearch() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;

    document.querySelectorAll('.menu-card').forEach(card => {
        const nameEl = card.querySelector('.menu-card__name');
        const descEl = card.querySelector('.menu-card__desc');

        if (!_cardCache.has(card)) {
            _cardCache.set(card, {
                name: nameEl?.innerHTML ?? '',
                desc: descEl?.innerHTML ?? '',
            });
        }

        const { name: origName, desc: origDesc } = _cardCache.get(card);
        const nameTxt = nameEl?.textContent.toLowerCase() ?? '';
        const descTxt = descEl?.textContent.toLowerCase() ?? '';
        const match   = !q || nameTxt.includes(q) || descTxt.includes(q);

        if (match) {
            card.style.display = '';
            if (nameEl) nameEl.innerHTML = q ? _highlight(origName, q) : origName;
            if (descEl) descEl.innerHTML = q ? _highlight(origDesc, q) : origDesc;
            visible++;
        } else {
            card.style.display = 'none';
            if (nameEl) nameEl.innerHTML = origName;
            if (descEl) descEl.innerHTML = origDesc;
        }
    });

    document.querySelectorAll('.section-title').forEach(title => {
        const grid = title.nextElementSibling;
        if (!grid) return;
        const hasVisible = !q || [...grid.querySelectorAll('.menu-card')]
            .some(c => c.style.display !== 'none');
        title.style.display = hasVisible ? '' : 'none';
        grid.style.display  = hasVisible ? '' : 'none';
    });

    if (noResults) noResults.style.display = visible === 0 && q ? 'flex' : 'none';
}

function _openSearch() {
    searchOverlay?.classList.add('open');
    searchToggle?.classList.add('active');
    setTimeout(() => searchInput?.focus(), 30);
}

function _closeSearch() {
    searchOverlay?.classList.remove('open');
    searchToggle?.classList.remove('active');
    if (searchInput) searchInput.value = '';
    _runSearch();
}

if (searchToggle) searchToggle.addEventListener('click', _openSearch);
if (searchClose)  searchClose.addEventListener('click', _closeSearch);
if (searchInput)  searchInput.addEventListener('input', _runSearch);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && searchOverlay?.classList.contains('open')) _closeSearch();
});