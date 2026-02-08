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

const cartManager = new CartManager();
const whatsAppService = new WhatsAppService();

// abrir Modal do Carrinho
cartBtn.addEventListener("click", function () {
    updateCartModal();
    cartModal.style.display = "flex";
    adjustCartModalHeight();
});

// função para fechar modal ao clicar fora
cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

closeModalBtn.addEventListener("click", function () {
    cartModal.style.display = "none";
});

menu.addEventListener("click", function (event) {
    let parentButton = event.target.closest(".add-to-cart-btn");

    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));
        cartManager.addItem(name, price);
        updateCartModal();
    }
});

//Atualiza carrinho
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    
    const cart = cartManager.getCart();
    const total = cartManager.getTotal();

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        cartItemElement.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">${item.name}</p>
            <p>Qtd: ${item.quantity}</p>
            <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
          </div>

         <button class="remove-from-cart-btn" data-name="${item.name}">
           Remover
         </button>

        </div>
        `;

        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.innerHTML = cartManager.getTotalItems();
}

// Função para remover item do carrinho 
cartItemsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");
        cartManager.removeItem(name);
        updateCartModal();
    }
});

addressInput.addEventListener("input", function (event) {
    let inputValue = event.target.value;

    if (inputValue !== "") {
        addressInput.classList.remove("border-red-500");
        addressWarn.classList.add("hidden");
    }
});

// Mostrar ou ocultar o campo de endereço com base na opção de entrega
Array.from(deliveryOptions).forEach(option => {
    option.addEventListener("change", function () {
        if (this.value === "delivery") {
            addressContainer.style.display = "block";
        } else {
            addressContainer.style.display = "none";
        }
    });
});

// FINALIZAR PEDIDO
checkoutBtn.addEventListener("click", function () {
    const isOpen = checkRestalrantOpen();
    if (!isOpen) {
        Toastify({
            text: "O Restaurante está fechado!",
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top",
            position: "center",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #7c1c1c, #120504)",
            },
        }).showToast();
        return;
    }

    const cart = cartManager.getCart();
    
    if (cart.length === 0) return;

    const deliveryOption = document.querySelector('input[name="delivery-option"]:checked').value;
    const address = addressInput.value;
    const observation = observationInput.value;

    if (deliveryOption === "delivery" && address === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    whatsAppService.sendOrder(cart, deliveryOption, address, observation);

    cartManager.clear();
    updateCartModal();
    observationInput.value = "";
});

// verificar a hora e manipular o card do horario //
function checkRestalrantOpen() {
    const data = new Date();
    const hora = data.getHours();
    return hora >= 7 && hora < 17;
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestalrantOpen();

if (isOpen) {
    spanItem.classList.remove("bg-red-900");
    spanItem.classList.add("bg-green-600");
} else {
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-900");
}

// Função para ajustar a altura máxima do modal do carrinho
function adjustCartModalHeight() {
    const windowHeight = window.innerHeight;
    const footerHeight = document.querySelector('footer').offsetHeight;
    const cartModal = document.getElementById('cart-modal');

    const maxModalHeight = windowHeight - footerHeight;
    cartModal.style.maxHeight = maxModalHeight + 'px';
}

const addObservationBtn = document.getElementById('add-observation-btn');
const observationContainer = document.getElementById('observation-container');

addObservationBtn.addEventListener('click', function () {
    observationContainer.classList.toggle('hidden');
});