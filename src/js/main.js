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

let cart = [];

// abrir Modal do Carrinho
cartBtn.addEventListener("click", function () {
    updateCartModal();
    cartModal.style.display = "flex";
    adjustCartModalHeight(); // Ajustar a altura máxima do modal quando ele for exibido
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
        // Add Carrinho
        addToCart(name, price);
    }
});

// função para add carrinho
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name == name);

    if (existingItem) {
        // se o item ja existe, apenas aumenta a quantidade +1
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
        });
    }

    updateCartModal();
}

//Atualiza carrinho
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

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
        total += item.price * item.quantity;

        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.innerHTML = cart.length;
}

// Função para remover item do carrinho 
cartItemsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");

        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index];

        if (item.quantity > 1) {
            item.quantity -= 1;
            updateCartModal();
            return;
        }
        cart.splice(index, 1);
        updateCartModal();
    }
}

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
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "linear-gradient(to right, #7c1c1c, #120504)",
            },
        }).showToast();
        return;
    }

    if (cart.length === 0) return;

    let message = cart.map(item => ` ${item.name} Quantidade: (${item.quantity}) Preço: R$ ${item.price} |`).join("");

    // Pegar a observação do cliente
    const observation = observationInput.value;

    // Adicionar a observação ao pedido
    message += `\n\nObservações: ${observation}`;

    if (document.querySelector('input[name="delivery-option"]:checked').value === "delivery") {
        if (addressInput.value === "") {
            addressWarn.classList.remove("hidden");
            addressInput.classList.add("border-red-500");
            return;
        }
        message += `\n\nEndereço: ${addressInput.value}`;
    } else {
        message += `\n\nRetirada no local.`;
    }

    const phone = "558399048716";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    console.log(url); // Verifique se a URL está correta
    window.open(url, "_blank");

    cart = [];
    updateCartModal();
    observationInput.value = ""; // Limpar campo de observação
});

// verificar a hora e manipular o card do horario //
function checkRestalrantOpen() {
    const data = new Date();
    const hora = data.getHours();
    return hora >= 7 && hora < 17; //true
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

    // Calcular a altura máxima do modal (altura da janela - altura do footer)
    const maxModalHeight = windowHeight - footerHeight;

    // Definir a altura máxima do modal
    cartModal.style.maxHeight = maxModalHeight + 'px';
}

// Chamar a função quando o modal do carrinho for exibido
cartBtn.addEventListener("click", function () {
    updateCartModal();
    cartModal.style.display = "flex";

    // Ajustar a altura máxima do modal quando ele for exibido
    adjustCartModalHeight();
});

const addObservationBtn = document.getElementById('add-observation-btn');
const observationContainer = document.getElementById('observation-container');

addObservationBtn.addEventListener('click', function () {
    observationContainer.classList.toggle('hidden');
});
