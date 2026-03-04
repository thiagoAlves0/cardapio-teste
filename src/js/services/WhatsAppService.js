// src/js/services/WhatsAppService.js

const PHONE = '5583998775498';

class WhatsAppService {
    constructor(phone = PHONE) {
        this.phone   = phone;
        this.baseURL = 'https://wa.me';
    }

    formatOrder(cart, deliveryOption, address = '', observation = '') {
        let message = '🛒 *PEDIDO - Lanchonete Central*\n\n';

        cart.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            message += `• ${item.name} (${item.quantity}x) — R$ ${itemTotal}\n`;
            if (item.note && item.note.trim()) {
                message += `  ↳ _${item.note.trim()}_\n`;
            }
        });

        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
        message += `\n💰 *TOTAL: R$ ${total.toFixed(2)}*\n\n`;

        if (deliveryOption === 'delivery') {
            message += `📍 *ENTREGA*\n${address}\n`;
        } else {
            message += `🏪 *RETIRADA NO LOCAL*\n`;
        }

        if (observation.trim()) {
            message += `\n📝 *OBS. GERAIS:*\n${observation}\n`;
        }

        message += `\n_Enviado via Cardápio Digital_`;
        return message;
    }

    sendOrder(cart, deliveryOption, address = '', observation = '') {
        try {
            const message = this.formatOrder(cart, deliveryOption, address, observation);
            const url     = `${this.baseURL}/${this.phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank', 'noopener,noreferrer');
            return true;
        } catch (error) {
            console.error('WhatsAppService: erro ao enviar pedido.', error);
            return false;
        }
    }
}

export default WhatsAppService;