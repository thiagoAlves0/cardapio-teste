// src/js/services/WhatsAppService.js
class WhatsAppService {
    constructor(phone = "5583998775498") {
        this.phone = phone;
        this.baseURL = "https://wa.me";
    }

    formatOrder(cart, deliveryOption, address = "", observation = "") {
        let message = "🛒 *PEDIDO - Lanchonete Central*\n\n";

        // Itens com observação individual
        cart.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            message += `• ${item.name} (${item.quantity}x) - R$ ${itemTotal}\n`;
            if (item.note && item.note.trim()) {
                message += `  ↳ _${item.note.trim()}_\n`;
            }
        });

        // Total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `\n💰 *TOTAL: R$ ${total.toFixed(2)}*\n\n`;

        // Entrega / Retirada
        if (deliveryOption === "delivery") {
            message += `📍 *ENTREGA*\n${address}\n`;
        } else {
            message += `🏪 *RETIRADA NO LOCAL*\n`;
        }

        // Observação geral
        if (observation.trim()) {
            message += `\n📝 *OBSERVAÇÕES GERAIS:*\n${observation}\n`;
        }

        message += `\n_Enviado via Cardápio Digital_`;
        return message;
    }

    sendOrder(cart, deliveryOption, address = "", observation = "") {
        try {
            const message = this.formatOrder(cart, deliveryOption, address, observation);
            const url = `${this.baseURL}/${this.phone}?text=${encodeURIComponent(message)}`;
            window.open(url, "_blank");
            return true;
        } catch (error) {
            console.error("Erro ao enviar pedido:", error);
            return false;
        }
    }
}

export default WhatsAppService;