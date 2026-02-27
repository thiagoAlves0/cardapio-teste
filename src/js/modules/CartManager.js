// src/js/modules/CartManager.js
class CartManager {
    constructor() {
        this.key = 'lanchoneteCart';
        this.lastOrderKey = 'lanchoneteLastOrder';
        this.cart = this.loadFromStorage();
    }

    addItem(name, price) {
        const existingItem = this.cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                name,
                price: parseFloat(price),
                quantity: 1,
                note: ""
            });
        }
        this.saveToStorage();
        return this.getCart();
    }

    removeItem(name) {
        const index = this.cart.findIndex(item => item.name === name);
        if (index === -1) return this.getCart();
        if (this.cart[index].quantity > 1) {
            this.cart[index].quantity -= 1;
        } else {
            this.cart.splice(index, 1);
        }
        this.saveToStorage();
        return this.getCart();
    }

    setItemNote(name, note) {
        const item = this.cart.find(i => i.name === name);
        if (item) {
            item.note = note;
            this.saveToStorage();
        }
    }

    // Carrega itens diretamente (usado para repetir pedido)
    loadCart(items) {
        this.cart = items.map(item => ({
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity,
            note: item.note || ""
        }));
        this.saveToStorage();
    }

    // Salva o último pedido finalizado no localStorage
    saveLastOrder(cart, deliveryOption, address, observation) {
        const lastOrder = {
            cart: cart.map(i => ({ ...i })),
            deliveryOption,
            address,
            observation,
            date: new Date().toISOString()
        };
        localStorage.setItem(this.lastOrderKey, JSON.stringify(lastOrder));
    }

    // Recupera o último pedido salvo
    getLastOrder() {
        const data = localStorage.getItem(this.lastOrderKey);
        return data ? JSON.parse(data) : null;
    }

    clear() {
        this.cart = [];
        localStorage.removeItem(this.key);
        return this.getCart();
    }

    getCart() {
        return [...this.cart];
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    saveToStorage() {
        localStorage.setItem(this.key, JSON.stringify(this.cart));
    }

    loadFromStorage() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }
}

export default CartManager;