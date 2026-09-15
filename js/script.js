/* ===========================================================
   SANTTA COSTELA — script.js
   Cardápio dinâmico + carrinho + WhatsApp + animações (anime.js)
=========================================================== */
(function () {
  "use strict";

  const money = (n) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  /* ---------------------------------------------------------
     Estado do carrinho (persistido no navegador do cliente)
  --------------------------------------------------------- */
  const STORAGE_KEY = "santta-costela-cart";
  let cart = loadCart();

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
  }

  function findItem(id) {
    return MENU_ITEMS.find((i) => i.id === id);
  }

  function cartTotal() {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = findItem(id);
      return item ? sum + item.price * qty : sum;
    }, 0);
  }

  function cartCount() {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  }

  /* ---------------------------------------------------------
     Construção do cardápio
  --------------------------------------------------------- */
  const menuGrid = document.getElementById("menuGrid");

  function renderMenu() {
    menuGrid.innerHTML = MENU_ITEMS.map(
      (item) => `
      <article class="dish-card" data-id="${item.id}">
        <div class="dish-photo">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <span class="dish-price-tag">${money(item.price)}</span>
        </div>
        <div class="dish-body">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="dish-actions">
            <div class="qty-control" data-role="qty-control">
              <button type="button" data-action="dec" aria-label="Diminuir quantidade">–</button>
              <span data-role="qty">1</span>
              <button type="button" data-action="inc" aria-label="Aumentar quantidade">+</button>
            </div>
            <button type="button" class="add-btn" data-action="add">Adicionar</button>
          </div>
        </div>
      </article>`
    ).join("");
  }
  renderMenu();

  // controla a quantidade selecionada em cada card ANTES de adicionar
  menuGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".dish-card");
    if (!card) return;
    const id = card.dataset.id;
    const qtyEl = card.querySelector('[data-role="qty"]');

    if (e.target.dataset.action === "inc") {
      qtyEl.textContent = parseInt(qtyEl.textContent, 10) + 1;
    }
    if (e.target.dataset.action === "dec") {
      const current = parseInt(qtyEl.textContent, 10);
      qtyEl.textContent = Math.max(1, current - 1);
    }
    if (e.target.dataset.action === "add") {
      const qty = parseInt(qtyEl.textContent, 10);
      addToCart(id, qty);
      flyToCart(card.querySelector(".dish-photo img"));
      qtyEl.textContent = 1;
      bounceCartIcon();
    }
  });

  function addToCart(id, qty) {
    cart[id] = (cart[id] || 0) + qty;
    saveCart();
    renderCart();
  }

  function updateCartQty(id, qty) {
    if (qty <= 0) {
      delete cart[id];
    } else {
      cart[id] = qty;
    }
    saveCart();
    renderCart();
  }

  /* ---------------------------------------------------------
     Drawer do carrinho
  --------------------------------------------------------- */
  const cartItemsEl = document.getElementById("cartItems");
  const cartEmptyMsg = document.getElementById("cartEmptyMsg");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartCountEl = document.getElementById("cartCount");
  const checkoutBtn = document.getElementById("checkoutBtn");

  function renderCart() {
    const entries = Object.entries(cart).filter(([, qty]) => qty > 0);

    if (entries.length === 0) {
      cartItemsEl.innerHTML = "";
      cartItemsEl.appendChild(cartEmptyMsg);
      checkoutBtn.disabled = true;
    } else {
      cartItemsEl.innerHTML = entries
        .map(([id, qty]) => {
          const item = findItem(id);
          if (!item) return "";
          return `
          <div class="cart-item" data-id="${id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <p>${money(item.price)} cada</p>
            </div>
            <div class="cart-item-controls">
              <div class="qty-control">
                <button type="button" data-action="dec" aria-label="Diminuir">–</button>
                <span>${qty}</span>
                <button type="button" data-action="inc" aria-label="Aumentar">+</button>
              </div>
            </div>
          </div>`;
        })
        .join("");
      checkoutBtn.disabled = false;
    }

    cartTotalEl.textContent = money(cartTotal());
    cartCountEl.textContent = cartCount();
  }

  cartItemsEl.addEventListener("click", (e) => {
    const row = e.target.closest(".cart-item");
    if (!row) return;
    const id = row.dataset.id;
    const current = cart[id] || 0;
    if (e.target.dataset.action === "inc") updateCartQty(id, current + 1);
    if (e.target.dataset.action === "dec") updateCartQty(id, current - 1);
  });

  /* ---------------------------------------------------------
     Abrir / fechar carrinho (anime.js)
  --------------------------------------------------------- */
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartToggle = document.getElementById("cartToggle");
  const cartClose = document.getElementById("cartClose");
  let cartOpen = false;

  // A abertura/fechamento do carrinho usa transição via CSS (robusta,
  // não depende de o anime.js ter carregado). O anime.js fica reservado
  // para os efeitos decorativos: faíscas, entrada do herói, voo até o
  // carrinho e revelação do cardápio.
  function openCart() {
    cartOpen = true;
    cartOverlay.classList.add("open");
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
  }
  function closeCart() {
    cartOpen = false;
    cartOverlay.classList.remove("open");
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
  }
  cartToggle.addEventListener("click", () => (cartOpen ? closeCart() : openCart()));
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  function bounceCartIcon() {
    if (!window.anime) return;
    try {
      anime({
        targets: cartToggle,
        scale: [1, 1.28, 1],
        rotate: ["0deg", "-8deg", "8deg", "0deg"],
        duration: 480,
        easing: "easeOutElastic(1, .6)",
      });
    } catch (e) {}
  }

  /* ---------------------------------------------------------
     Animação "voar para o carrinho" ao adicionar item
  --------------------------------------------------------- */
  function flyToCart(imgEl) {
    if (!imgEl || !window.anime) return;
    const startRect = imgEl.getBoundingClientRect();
    const endRect = cartToggle.getBoundingClientRect();

    const clone = imgEl.cloneNode(true);
    clone.className = "fly-clone";
    clone.style.left = startRect.left + "px";
    clone.style.top = startRect.top + "px";
    clone.style.width = startRect.width * 0.4 + "px";
    clone.style.height = startRect.height * 0.4 + "px";
    document.body.appendChild(clone);

    try {
      anime({
        targets: clone,
        left: endRect.left + endRect.width / 2 - 10,
        top: endRect.top + endRect.height / 2 - 10,
        width: 12,
        height: 12,
        opacity: [1, 0.4],
        duration: 650,
        easing: "easeInCubic",
        complete: () => clone.remove(),
      });
    } catch (e) {
      clone.remove();
    }
  }

  /* ---------------------------------------------------------
     WhatsApp — links e mensagem do pedido
  --------------------------------------------------------- */
  function waLink(text) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function setSimpleWhatsappLinks() {
    const link = waLink(WHATSAPP_GREETING);
    ["heroWhatsapp", "footerWhatsapp", "floatWhatsapp"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.href = link;
    });
  }
  setSimpleWhatsappLinks();

  function buildOrderMessage() {
    const lines = ["Olá! Quero fazer o seguinte pedido no Santta Costela:", ""];
    Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .forEach(([id, qty]) => {
        const item = findItem(id);
        if (!item) return;
        lines.push(`• ${qty}x ${item.name} — ${money(item.price * qty)}`);
      });
    lines.push("");
    lines.push(`Total: ${money(cartTotal())}`);
    return lines.join("\n");
  }

  checkoutBtn.addEventListener("click", () => {
    if (cartCount() === 0) return;
    window.open(waLink(buildOrderMessage()), "_blank", "noopener");
  });

  /* ---------------------------------------------------------
     Menu mobile
  --------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
  mainNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => mainNav.classList.remove("open"))
  );

  /* ---------------------------------------------------------
     Ano no rodapé
  --------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Faíscas de brasa animadas no hero (anime.js, loop contínuo)
  --------------------------------------------------------- */
  function initEmbers() {
    const layer = document.getElementById("emberLayer");
    const count = window.innerWidth < 600 ? 14 : 26;

    for (let i = 0; i < count; i++) {
      const spark = document.createElement("span");
      spark.className = "ember-spark";
      spark.style.left = Math.random() * 100 + "%";
      const size = 2 + Math.random() * 3;
      spark.style.width = size + "px";
      spark.style.height = size + "px";
      layer.appendChild(spark);
      animateSpark(spark);
    }
  }

  function animateSpark(spark) {
    if (!window.anime) return; // efeito decorativo: sem anime.js, simplesmente não anima
    const rise = 260 + Math.random() * 340;
    const drift = (Math.random() - 0.5) * 120;
    const duration = 3200 + Math.random() * 3200;
    const delay = Math.random() * 4000;

    try {
      anime({
        targets: spark,
        translateY: -rise,
        translateX: drift,
        opacity: [0, 0.9, 0],
        scale: [0.6, 1, 0.3],
        duration: duration,
        delay: delay,
        easing: "easeOutQuad",
        complete: () => {
          // reset position and loop
          spark.style.left = Math.random() * 100 + "%";
          anime.set(spark, { translateY: 0, translateX: 0 });
          animateSpark(spark);
        },
      });
    } catch (e) {}
  }
  initEmbers();

  /* ---------------------------------------------------------
     Entrada do herói (um único momento orquestrado)
  --------------------------------------------------------- */
  if (window.anime) {
    try {
      anime
        .timeline({ easing: "easeOutCubic" })
        .add({
          targets: ".hero-kicker",
          opacity: [0, 1],
          translateY: [16, 0],
          duration: 600,
        })
        .add(
          {
            targets: ".hero-title",
            opacity: [0, 1],
            translateY: [26, 0],
            duration: 750,
          },
          "-=400"
        )
        .add(
          {
            targets: ".hero-sub",
            opacity: [0, 1],
            translateY: [18, 0],
            duration: 650,
          },
          "-=450"
        )
        .add(
          {
            targets: ".hero-actions .btn",
            opacity: [0, 1],
            translateY: [14, 0],
            delay: anime.stagger(90),
            duration: 550,
          },
          "-=400"
        );
    } catch (e) {}
  }

  /* ---------------------------------------------------------
     Revelação do cardápio ao entrar na tela (uma vez).
     Sempre garante que os cards fiquem visíveis, com ou sem anime.js.
  --------------------------------------------------------- */
  function revealMenuCards() {
    const cards = document.querySelectorAll("#menuGrid .dish-card");
    if (window.anime) {
      try {
        anime({
          targets: cards,
          opacity: [0, 1],
          translateY: [34, 0],
          delay: anime.stagger(110),
          duration: 650,
          easing: "easeOutCubic",
        });
        return;
      } catch (e) {}
    }
    cards.forEach((c) => {
      c.style.opacity = 1;
      c.style.transform = "none";
    });
  }

  const menuObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealMenuCards();
          obs.disconnect();
        }
      });
    },
    { threshold: 0.15 }
  );
  menuObserver.observe(menuGrid);

  // Rede de segurança: se por qualquer motivo os cards continuarem
  // invisíveis após alguns segundos (ex.: CDN do anime.js bloqueado),
  // garante que o cardápio nunca fique escondido do cliente.
  setTimeout(() => {
    document.querySelectorAll("#menuGrid .dish-card").forEach((c) => {
      if (getComputedStyle(c).opacity === "0") {
        c.style.opacity = 1;
        c.style.transform = "none";
      }
    });
  }, 2500);

  /* ---------------------------------------------------------
     Estado inicial
  --------------------------------------------------------- */
  renderCart();
})();
