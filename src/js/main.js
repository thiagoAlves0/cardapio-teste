import CartManager from './modules/CartManager.js';
import WhatsAppService from './services/WhatsAppService.js';

const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
const observationInput = document.getElementById("observation");
const deliveryOptions = document.getElementsByName("delivery-option");
const addressContainer = document.getElementById("address-container");
const observationContainer = document.getElementById("observation-container");

const cartManager = new CartManager();
const whatsAppService = new WhatsAppService();

// ─── Abrir Modal ────────────────────────────────────────────────────
cartBtn.addEventListener("click", function () {
    updateCartModal();
    cartModal.style.display = "flex";
    adjustCartModalHeight();
});

// Fechar ao clicar no backdrop
cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

closeModalBtn.addEventListener("click", function () {
    cartModal.style.display = "none";
});

// ─── Adicionar ao carrinho pelo menu ────────────────────────────────
menu.addEventListener("click", function (event) {
    const parentButton = event.target.closest(".add-to-cart-btn");
    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));
        cartManager.addItem(name, price);
        updateCartModal();
    }
});

// ─── Renderizar modal do carrinho ───────────────────────────────────
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    const cart = cartManager.getCart();
    const total = cartManager.getTotal();
    const lastOrder = cartManager.getLastOrder();

    if (cart.length === 0) {
        // Estado vazio
        let repeatBtn = "";
        if (lastOrder && lastOrder.cart && lastOrder.cart.length > 0) {
            const dataFormatada = new Date(lastOrder.date).toLocaleDateString("pt-BR", {
                day: "2-digit", month: "2-digit"
            });
            const totalFormatado = lastOrder.cart
                .reduce((s, i) => s + i.price * i.quantity, 0)
                .toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

            repeatBtn = `
            <button id="repeat-order-btn"
              style="margin-top:8px;background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.25);border-radius:12px;padding:11px 20px;color:#facc15;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;width:100%;transition:.2s;">
              🔄 Repetir pedido de ${dataFormatada} · ${totalFormatado}
            </button>`;
        }

        cartItemsContainer.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:36px 20px 24px;gap:10px;opacity:.55;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <p style="font-family:'DM Sans',sans-serif;font-size:.9rem;color:rgba(255,255,255,0.4);text-align:center;margin:0;">Seu carrinho está vazio<br><span style="font-size:.78rem;">Adicione algo do menu 😊</span></p>
        </div>
        ${repeatBtn ? `<div style="padding:0 0 8px;">${repeatBtn}</div>` : ""}`;
    } else {
        cart.forEach((item, index) => {
            const el = document.createElement("div");
            el.style.cssText = `display:flex;align-items:flex-start;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.06);animation:lcFadeUp .3s cubic-bezier(0.22,1,0.36,1) ${index * 60}ms both;gap:8px;`;

            const notePreview = item.note
                ? `📝 ${item.note.length > 20 ? item.note.substring(0, 20) + "…" : item.note}`
                : "+ obs.";

            el.innerHTML = `
            <div style="flex:1;min-width:0;">
              <p style="font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;color:#fff;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</p>
              <p style="font-family:'DM Sans',sans-serif;font-size:.75rem;color:rgba(255,255,255,0.3);margin:2px 0 4px;">R$ ${item.price.toFixed(2)} cada</p>
              <button class="toggle-note-btn" data-index="${index}" data-name="${item.name}">${notePreview}</button>
              <input class="item-note-input" data-index="${index}" data-name="${item.name}"
                style="display:${item.note ? "block" : "none"};"
                placeholder="Obs. para este item..." />
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;padding-top:2px;">
              <button class="remove-from-cart-btn btn-remove-cart"
                data-name="${item.name}"
                style="width:32px;height:32px;border-radius:50%;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);color:#f87171;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s;">−</button>
              <span style="font-family:'DM Sans',sans-serif;font-weight:700;color:#fff;font-size:.95rem;min-width:16px;text-align:center;">${item.quantity}</span>
              <button class="add-from-cart-btn btn-add-cart"
                data-name="${item.name}" data-price="${item.price}"
                style="width:32px;height:32px;border-radius:50%;background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.2);color:#facc15;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s;">+</button>
              <span style="font-family:'DM Sans',sans-serif;font-weight:700;color:#facc15;font-size:.9rem;min-width:52px;text-align:right;">R$ ${(item.price * item.quantity).toFixed(2)}</span>
            </div>`;

            // Define o value via JS para evitar problemas com caracteres especiais
            el.querySelector(".item-note-input").value = item.note || "";
            cartItemsContainer.appendChild(el);
        });
    }

    cartTotal.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    cartCounter.innerHTML = cartManager.getTotalItems();
}

// ─── Delegação de cliques no carrinho ───────────────────────────────
cartItemsContainer.addEventListener("click", function (event) {
    const btn = event.target.closest("button");
    if (!btn) return;

    const name = btn.getAttribute("data-name");

    // Remover item
    if (btn.classList.contains("remove-from-cart-btn")) {
        cartManager.removeItem(name);
        updateCartModal();
        return;
    }

    // Adicionar item
    if (btn.classList.contains("add-from-cart-btn")) {
        const price = parseFloat(btn.getAttribute("data-price"));
        cartManager.addItem(name, price);
        updateCartModal();
        return;
    }

    // Toggle observação por item
    if (btn.classList.contains("toggle-note-btn")) {
        const index = btn.getAttribute("data-index");
        const noteInput = cartItemsContainer.querySelector(`.item-note-input[data-index="${index}"]`);
        if (noteInput) {
            const isVisible = noteInput.style.display !== "none";
            noteInput.style.display = isVisible ? "none" : "block";
            if (!isVisible) noteInput.focus();
        }
        return;
    }

    // Repetir último pedido
    if (btn.id === "repeat-order-btn") {
        repeatLastOrder();
        return;
    }
});

// ─── Salva nota por item (sem re-render) ────────────────────────────
cartItemsContainer.addEventListener("input", function (event) {
    const noteInput = event.target.closest(".item-note-input");
    if (!noteInput) return;

    const name = noteInput.getAttribute("data-name");
    const index = noteInput.getAttribute("data-index");
    cartManager.setItemNote(name, noteInput.value);

    // Atualiza o label do botão toggle ao vivo
    const toggleBtn = cartItemsContainer.querySelector(`.toggle-note-btn[data-index="${index}"]`);
    if (toggleBtn) {
        const note = noteInput.value;
        toggleBtn.textContent = note
            ? `📝 ${note.length > 20 ? note.substring(0, 20) + "…" : note}`
            : "+ obs.";
    }
});

// ─── Repetir último pedido ──────────────────────────────────────────
function repeatLastOrder() {
    const lastOrder = cartManager.getLastOrder();
    if (!lastOrder) return;

    // Carrega os itens
    cartManager.loadCart(lastOrder.cart);

    // Restaura opção de entrega
    const deliveryRadio = document.querySelector(
        `input[name="delivery-option"][value="${lastOrder.deliveryOption}"]`
    );
    if (deliveryRadio) {
        deliveryRadio.checked = true;
        deliveryRadio.dispatchEvent(new Event("change"));
    }

    // Restaura endereço
    addressInput.value = lastOrder.address || "";

    // Restaura observação geral
    if (lastOrder.observation) {
        observationInput.value = lastOrder.observation;
        observationContainer.classList.remove("hidden");
    }

    updateCartModal();
}

// ─── Validação de endereço ──────────────────────────────────────────
addressInput.addEventListener("input", function () {
    if (this.value !== "") {
        addressInput.classList.remove("border-red-500");
        addressWarn.classList.add("hidden");
    }
});

// ─── Toggle Entrega / Retirada ──────────────────────────────────────
Array.from(deliveryOptions).forEach(option => {
    option.addEventListener("change", function () {
        const deliveryPill = document.querySelector(".delivery-pill");
        const pickupPill = document.querySelector(".pickup-pill");
        if (this.value === "delivery") {
            addressContainer.style.display = "block";
            deliveryPill.style.background = "#facc15";
            deliveryPill.style.color = "#111";
            pickupPill.style.background = "transparent";
            pickupPill.style.color = "rgba(255,255,255,0.45)";
        } else {
            addressContainer.style.display = "none";
            pickupPill.style.background = "#facc15";
            pickupPill.style.color = "#111";
            deliveryPill.style.background = "transparent";
            deliveryPill.style.color = "rgba(255,255,255,0.45)";
        }
    });
});

// ─── Finalizar pedido ───────────────────────────────────────────────
checkoutBtn.addEventListener("click", function () {
    if (!checkRestalrantOpen()) {
        Toastify({
            text: "O Restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            stopOnFocus: true,
            style: { background: "linear-gradient(to right, #7c1c1c, #120504)" },
        }).showToast();
        return;
    }

    const cart = cartManager.getCart();
    if (cart.length === 0) return;

    const deliveryOption = document.querySelector('input[name="delivery-option"]:checked').value;
    const address = addressInput.value;
    const observation = observationInput.value;

    if (deliveryOption === "delivery" && address.trim() === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    // Salva o pedido antes de limpar
    cartManager.saveLastOrder(cart, deliveryOption, address, observation);

    whatsAppService.sendOrder(cart, deliveryOption, address, observation);

    cartManager.clear();
    updateCartModal();
    observationInput.value = "";
    observationContainer.classList.add("hidden");
    addressInput.value = "";
    cartModal.style.display = "none";
});

// ─── Verificar horário de funcionamento ─────────────────────────────
function checkRestalrantOpen() {
    return true; // REMOVER ESTA LINHA PARA HABILITAR VERIFICAÇÃO 
    const data = new Date();
    const hora = data.getHours();
    const dia = data.getDay(); // 0 = domingo
    return dia !== 0 && hora >= 7 && hora < 17;
}

// Badge aberto/fechado
const spanItem = document.getElementById("date-span");
const isOpen = checkRestalrantOpen();

if (isOpen) {
    spanItem.style.background = "rgba(22,163,74,0.15)";
    spanItem.style.border = "1px solid rgba(22,163,74,0.35)";
    spanItem.innerHTML = `
    <span style="width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;box-shadow:0 0 8px #4ade80;animation:lcPulse 1.5s ease infinite;"></span>
    <span style="font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:500;color:#4ade80;">Aberto agora</span>
    <span style="width:1px;height:12px;background:rgba(255,255,255,0.15);display:inline-block;"></span>
    <span style="font-family:'DM Sans',sans-serif;font-size:.8rem;color:rgba(255,255,255,0.4);">Seg–Sáb · 7h às 17h</span>`;
} else {
    spanItem.style.background = "rgba(153,27,27,0.2)";
    spanItem.style.border = "1px solid rgba(153,27,27,0.4)";
    spanItem.innerHTML = `
    <span style="width:7px;height:7px;border-radius:50%;background:#f87171;display:inline-block;"></span>
    <span style="font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:500;color:#f87171;">Fechado agora</span>
    <span style="width:1px;height:12px;background:rgba(255,255,255,0.15);display:inline-block;"></span>
    <span style="font-family:'DM Sans',sans-serif;font-size:.8rem;color:rgba(255,255,255,0.4);">Abre Seg–Sáb às 7h</span>`;
}

// ─── Ajustar altura máxima do modal ─────────────────────────────────
function adjustCartModalHeight() {
    const windowHeight = window.innerHeight;
    const footerHeight = document.querySelector("footer").offsetHeight;
    document.getElementById("cart-modal").style.maxHeight = (windowHeight - footerHeight) + "px";
}

// ─── Toggle observação geral ─────────────────────────────────────────
const addObservationBtn = document.getElementById("add-observation-btn");
addObservationBtn.addEventListener("click", function () {
    observationContainer.classList.toggle("hidden");
});