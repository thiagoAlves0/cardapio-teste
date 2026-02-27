# 🥪 Cardápio Digital — Lanchonete Central

Cardápio digital responsivo com carrinho de compras e envio de pedidos via WhatsApp.

## ✨ Funcionalidades

- 📋 Cardápio completo com categorias (F's, Tradicionais, Especiais, Salgados, Sucos, Vitaminas e mais)
- 🛒 Carrinho com adicionar, remover e ajustar quantidade
- 📝 Observação individual por item
- 🔄 Repetir último pedido (salvo no localStorage)
- 🛵 Opções de entrega ou retirada no local
- 💬 Envio do pedido formatado via WhatsApp
- 🕐 Badge de aberto/fechado dinâmico (Seg–Sáb · 7h às 17h)
- 📱 Layout mobile-first com bottom sheet animado

## 🛠️ Tecnologias

- HTML5 + CSS3 (animações próprias)
- Tailwind CSS
- JavaScript ES6 modular
- Google Fonts (Playfair Display + DM Sans)
- Toastify JS

## 📁 Estrutura

```
├── index.html
├── assets/
└── src/
    ├── css/
    │   └── output.css
    └── js/
        ├── main.js
        ├── modules/
        │   └── CartManager.js
        └── services/
            └── WhatsAppService.js
```

## 🚀 Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/thiagoAlves0/cardapio-teste

# Abra o index.html no navegador
# ou use um servidor local como Live Server (VS Code)
```

> ⚠️ O projeto usa ES6 modules — é necessário rodar via servidor local, não direto pelo sistema de arquivos.

## 🌐 Deploy

Produção disponível em: [lanchonete-central.vercel.app](https://lanchonete-central.vercel.app)

Deploy automático via Vercel a cada push na branch `main` do repositório de produção.

## 📦 Repositórios

| Ambiente | Repositório |
|----------|------------|
| Teste | [cardapio-teste](https://github.com/thiagoAlves0/cardapio-teste) |
| Produção | [Cardapio_Lanchonete_C](https://github.com/thiagoAlves0/Cardapio_Lanchonete_C) |

## 👨‍💻 Desenvolvido por

[@thlago.alves](https://www.instagram.com/thlago.alves)
