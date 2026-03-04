// src/js/modules/CartManager.js

const CART_KEY       = 'lc_cart';
const LAST_ORDER_KEY = 'lc_last_order';
const MAX_QTY        = 99;
const MAX_NOTE_LEN   = 120;
const MAX_ITEMS      = 50;

class CartManager {
    constructor() {
        this.cart = this._loadFromStorage();
    }

    _sanitize(str) {
        return String(str)
            .slice(0, MAX_NOTE_LEN)
            .replace(/[<>"'`]/g, '');
    }

    addItem(name, price) {
        if (!name || isNaN(price) || price < 0) return this.getCart();
        if (this.cart.length >= MAX_ITEMS) return this.getCart();

        const existing = this.cart.find(i => i.name === name);
        if (existing) {
            existing.quantity = Math.min(existing.quantity + 1, MAX_QTY);
        } else {
            this.cart.push({
                name:     String(name),
                price:    parseFloat(price.toFixed(2)),
                quantity: 1,
                note:     ''
            });
        }
        this._saveToStorage();
        return this.getCart();
    }

    removeItem(name) {
        const index = this.cart.findIndex(i => i.name === name);
        if (index === -1) return this.getCart();

        if (this.cart[index].quantity > 1) {
            this.cart[index].quantity -= 1;
        } else {
            this.cart.splice(index, 1);
        }
        this._saveToStorage();
        return this.getCart();
    }

    setItemNote(name, note) {
        const item = this.cart.find(i => i.name === name);
        if (item) {
            item.note = this._sanitize(note);
            this._saveToStorage();
        }
    }

    loadCart(items) {
        if (!Array.isArray(items)) return;
        this.cart = items
            .slice(0, MAX_ITEMS)
            .map(i => ({
                name:     String(i.name),
                price:    parseFloat(i.price),
                quantity: Math.min(parseInt(i.quantity) || 1, MAX_QTY),
                note:     this._sanitize(i.note || '')
            }));
        this._saveToStorage();
    }

    saveLastOrder(cart, deliveryOption, address, observation) {
        try {
            const lastOrder = {
                cart:           cart.map(i => ({ ...i })),
                deliveryOption: deliveryOption === 'pickup' ? 'pickup' : 'delivery',
                address:        String(address).slice(0, 200),
                observation:    String(observation).slice(0, 300),
                date:           new Date().toISOString()
            };
            localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(lastOrder));
        } catch (e) {
            console.warn('CartManager: falha ao salvar último pedido.', e);
        }
    }

    getLastOrder() {
        try {
            const data = localStorage.getItem(LAST_ORDER_KEY);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    clear() {
        this.cart = [];
        localStorage.removeItem(CART_KEY);
        return this.getCart();
    }

    getCart()       { return [...this.cart]; }
    getTotal()      { return this.cart.reduce((t, i) => t + i.price * i.quantity, 0); }
    getTotalItems() { return this.cart.reduce((t, i) => t + i.quantity, 0); }

    _saveToStorage() {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(this.cart));
        } catch (e) {
            console.warn('CartManager: falha ao salvar no localStorage.', e);
        }
    }

    _loadFromStorage() {
        try {
            const data = localStorage.getItem(CART_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }
}

export default CartManager;