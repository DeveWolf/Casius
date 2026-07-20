/* ============================================
   CASIUS IMPORTADORA — JavaScript combinado
   (menú móvil, carrito, catálogo y formulario
   de contacto, todo en un solo archivo)
   ============================================ */

/* ============================================
   1. UTILIDADES
   ============================================ */

const CART_KEY = "casius_cart";

function formatPrice(price) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

/* ============================================
   2. CARRITO (compartido en todas las páginas)
   ============================================ */

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    /* almacenamiento no disponible: el carrito seguirá funcionando solo en esta sesión */
  }
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: cart }));
}

function isInCart(id) {
  return getCart().some((p) => p.id === id);
}

function addToCart(product) {
  const cart = getCart();
  if (cart.some((p) => p.id === product.id)) return;
  cart.push(product);
  saveCart(cart);
}

function removeFromCart(id) {
  const cart = getCart().filter((p) => p.id !== id);
  saveCart(cart);
}

function renderCartUI() {
  const cart = getCart();

  // Badge del header
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = cart.length;
    el.classList.toggle("show", cart.length > 0);
  });

  // Lista del drawer
  const list = document.getElementById("cartItems");
  const totalWrap = document.getElementById("cartTotalWrap");
  if (list) {
    if (cart.length === 0) {
      list.innerHTML = `<p class="cart-empty">Tu carrito está vacío. Agrega equipos desde el catálogo.</p>`;
      if (totalWrap) totalWrap.style.display = "none";
    } else {
      list.innerHTML = cart
        .map(
          (p) => `
        <div class="cart-item">
          <div class="cart-item-info">
            <p class="name">${p.name}</p>
            <p class="cat">${p.category}</p>
            <p class="price">${formatPrice(p.price)}</p>
          </div>
          <button class="cart-item-remove" data-remove="${p.id}" aria-label="Quitar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>`
        )
        .join("");

      if (totalWrap) {
        totalWrap.style.display = "block";
        const total = cart.reduce((sum, p) => sum + p.price, 0);
        document.getElementById("cartTotalAmount").textContent = formatPrice(total);
      }

      list.querySelectorAll("[data-remove]").forEach((btn) => {
        btn.addEventListener("click", () => {
          removeFromCart(Number(btn.dataset.remove));
        });
      });
    }
  }

  // Botones "Agregar" en tarjetas de producto (si existen en esta página)
  document.querySelectorAll("[data-add-id]").forEach((btn) => {
    const id = Number(btn.dataset.addId);
    const inCart = cart.some((p) => p.id === id);
    btn.classList.toggle("in-cart", inCart);
    btn.innerHTML = inCart
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg>Agregado`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>Agregar`;
  });
}

window.addEventListener("cart:updated", renderCartUI);

function openCartDrawer() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("open");
  document.body.style.overflow = "";
}

/* ============================================
   3. CATÁLOGO (datos, filtros, render)
   Solo se ejecuta si la página tiene #productsGrid
   ============================================ */

const CATEGORIES = ["Todos", "Maquinaria", "Llantas", "Repuestos", "Accesorios"];

const SORT_OPTIONS = [
  { label: "Relevancia", value: "default" },
  { label: "Menor precio", value: "price-asc" },
  { label: "Mayor precio", value: "price-desc" },
  { label: "Nombre A-Z", value: "name-asc" },
];

const CATEGORY_GRADIENTS = {
  Maquinaria: "linear-gradient(160deg, rgba(30,58,138,0.4), rgba(30,64,175,0.18))",
  Llantas: "linear-gradient(160deg, rgba(30,41,59,0.6), rgba(51,65,85,0.28))",
  Repuestos: "linear-gradient(160deg, rgba(120,53,15,0.32), rgba(146,64,14,0.16))",
  Accesorios: "linear-gradient(160deg, rgba(6,78,59,0.32), rgba(6,95,70,0.16))",
};

const ALL_PRODUCTS = [
  // Maquinaria
  { id: 1, name: "MOTO", category: "Maquinaria", price: 6000, origin: "Japón", description: "Moto Linear", stock: true, image: "img/moto.png" },
  { id: 2, name: "Monta Carga verde", category: "Maquinaria", price: 280000, origin: "Japón", description: "Monta Carga Verde.", stock: true, image: "img/montacargaVerde.png" },
  { id: 3, name: "Monta Carga Rojo", category: "Maquinaria", price: 320000, origin: "EE.UU.", description: "Monta Carga Roja.", stock: true, image: "img/montacargaRojo.png" },
  { id: 4, name: "Grúa Torre 80m", category: "Maquinaria", price: 195000, origin: "Alemania", description: "Grúa torre de 80 metros de altura, capacidad máxima 8 toneladas en punta.", stock: false },
  { id: 5, name: "Motoniveladora 140G", category: "Maquinaria", price: 165000, origin: "EE.UU.", description: "Motoniveladora para nivelación de terrenos. Hoja de trabajo 3,7m, motor 140HP.", stock: true },
  { id: 6, name: "Cosechadora Combinada CR", category: "Maquinaria", price: 390000, origin: "Bélgica", description: "Cosechadora de alta capacidad 350HP para granos. Ancho de corte 9,1m.", stock: true },
  { id: 7, name: "Perforadora Rotativa RT", category: "Maquinaria", price: 425000, origin: "Suecia", description: "Perforadora para minería a cielo abierto. Profundidad hasta 30m, diámetro 160-229mm.", stock: true },
  { id: 8, name: "Cargador Frontal 966", category: "Maquinaria", price: 210000, origin: "Japón", description: "Cargador frontal de ruedas con cubeta de 3,8m³. Motor 222HP.", stock: true },
  // Llantas
  { id: 9, name: "Llanta OTR 29.5R25 Minería", category: "Llantas", price: 4800, origin: "China", description: "Llanta radial para minería 29.5R25. Resistente a cortes y punciones. E4 TL.", stock: true },
  { id: 10, name: "Llanta OTR 27.00R49 Acarreo", category: "Llantas", price: 18500, origin: "Japón", description: "Llanta gigante para camión de acarreo 27.00R49. Carga máxima 95 toneladas.", stock: true },
  { id: 11, name: "Llanta Industrial 12.00-20 GK", category: "Llantas", price: 620, origin: "China", description: "Llanta para cargador frontal y maquinaria de construcción ligera.", stock: true },
  { id: 12, name: "Llanta OTR 23.5R25 Cargador", category: "Llantas", price: 3200, origin: "Corea", description: "Llanta radial L5 para cargador en operaciones de alta abrasión.", stock: false },
  // Repuestos
  { id: 13, name: "Kit de Filtros Motor CAT", category: "Repuestos", price: 890, origin: "EE.UU.", description: "Kit completo de filtros (aceite, combustible, aire, hidráulico) para motores CAT C9-C13.", stock: true },
  { id: 14, name: "Bomba Hidráulica Principal", category: "Repuestos", price: 12400, origin: "Japón", description: "Bomba hidráulica de pistones axiales compatible con excavadoras Komatsu PC200-8.", stock: true },
  { id: 15, name: "Cadena de Rodamiento 600mm", category: "Repuestos", price: 5600, origin: "Japón", description: "Cadena de acero templado 600mm paso 216mm para excavadoras de 20-30T.", stock: true },
  { id: 16, name: "Cuchilla de Motoniveladora", category: "Repuestos", price: 340, origin: "Brasil", description: "Cuchilla de corte en acero bimetálico 185x16mm para motoniveladoras John Deere y CAT.", stock: true },
  // Accesorios
  { id: 17, name: "Cámara de Retrovisión Industrial", category: "Accesorios", price: 480, origin: "China", description: "Sistema de cámara HD resistente a polvo y agua para maquinaria pesada. IP69K.", stock: true },
  { id: 18, name: "GPS Minero de Alta Precisión", category: "Accesorios", price: 7200, origin: "EE.UU.", description: "Sistema GPS RTK para control de flota minera. Precisión ±2cm en tiempo real.", stock: true },
  { id: 19, name: "Extintor Automático FM-200", category: "Accesorios", price: 1850, origin: "Alemania", description: "Sistema de extinción automática para cabinas de maquinaria pesada. Homologado.", stock: false },
  { id: 20, name: "Luces LED Trabajo 150W", category: "Accesorios", price: 210, origin: "China", description: "Barra de luces LED 150W para trabajo nocturno en excavadoras y camiones. 10-80V.", stock: true },
];

let catalogState = { search: "", category: "Todos", sort: "default" };

function getFilteredProducts() {
  let list = [...ALL_PRODUCTS];

  if (catalogState.category !== "Todos") {
    list = list.filter((p) => p.category === catalogState.category);
  }

  if (catalogState.search.trim()) {
    const q = catalogState.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q)
    );
  }

  if (catalogState.sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (catalogState.sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (catalogState.sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

  return list;
}

function productCardHTML(p) {
  const cart = getCart();
  const inCart = cart.some((c) => c.id === p.id);
  const gradient = CATEGORY_GRADIENTS[p.category] || "linear-gradient(160deg, rgba(100,116,139,0.3), rgba(100,116,139,0.12))";

  return `
    <div class="gradient-card product-card">
      <div class="product-image">
  <img src="${p.image}" alt="${p.name}" class="product-img">

  <span class="badge-stock ${p.stock ? "in" : "out"}">
    ${p.stock ? "En stock" : "Consultar"}
  </span>

  <span class="badge-origin">${p.origin}</span>
</div>
      <div class="product-body">
        <div>
          <p class="product-cat">${p.category}</p>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.description}</p>
        </div>
        <div class="product-footer">
          <p class="product-price">${formatPrice(p.price)}</p>
          <button class="add-btn ${inCart ? "in-cart" : ""}" data-add-id="${p.id}">
            ${
              inCart
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg>Agregado'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>Agregar'
            }
          </button>
        </div>
      </div>
    </div>`;
}

function renderCategoryTabs() {
  const wrap = document.getElementById("categoryTabs");
  wrap.innerHTML = CATEGORIES.map((cat) => {
    const count = cat === "Todos" ? "" : ` <span class="count">(${ALL_PRODUCTS.filter((p) => p.category === cat).length})</span>`;
    return `<button class="tab-btn ${catalogState.category === cat ? "active" : ""}" data-cat="${cat}">${cat}${count}</button>`;
  }).join("");

  wrap.querySelectorAll("[data-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      catalogState.category = btn.dataset.cat;
      renderCatalog();
    });
  });
}

function renderProductsGrid() {
  const filtered = getFilteredProducts();
  const grid = document.getElementById("productsGrid");
  const empty = document.getElementById("emptyState");
  const countEl = document.getElementById("resultsCount");

  if (filtered.length === 0) {
    grid.style.display = "none";
    empty.style.display = "flex";
  } else {
    grid.style.display = "grid";
    empty.style.display = "none";
    grid.innerHTML = filtered.map(productCardHTML).join("");
    grid.querySelectorAll("[data-add-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const product = ALL_PRODUCTS.find((p) => p.id === Number(btn.dataset.addId));
        if (product) addToCart(product);
      });
    });
  }

  let text = filtered.length === 0
    ? "Sin resultados"
    : `<strong>${filtered.length}</strong> ${filtered.length === 1 ? "producto" : "productos"} encontrados`;
  if (catalogState.search) text += ` para <strong>"${catalogState.search}"</strong>`;
  countEl.innerHTML = text;
}

function renderCatalog() {
  renderCategoryTabs();
  renderProductsGrid();
}

function initCatalogPage() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return; // esta página no es el catálogo

  const searchClear = document.getElementById("searchClear");
  const sortSelect = document.getElementById("sortSelect");
  const resetBtn = document.getElementById("resetFilters");

  SORT_OPTIONS.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = o.value;
    opt.textContent = o.label;
    sortSelect.appendChild(opt);
  });

  searchInput.addEventListener("input", (e) => {
    catalogState.search = e.target.value;
    searchClear.classList.toggle("show", catalogState.search.length > 0);
    renderCatalog();
  });

  searchClear.addEventListener("click", () => {
    catalogState.search = "";
    searchInput.value = "";
    searchClear.classList.remove("show");
    renderCatalog();
  });

  sortSelect.addEventListener("change", (e) => {
    catalogState.sort = e.target.value;
    renderCatalog();
  });

  resetBtn.addEventListener("click", () => {
    catalogState.search = "";
    catalogState.category = "Todos";
    searchInput.value = "";
    searchClear.classList.remove("show");
    renderCatalog();
  });

  window.addEventListener("cart:updated", renderProductsGrid);

  renderCatalog();
}

/* ============================================
   4. FORMULARIO DE CONTACTO
   Solo se ejecuta si la página tiene #contactForm
   ============================================ */

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return; // esta página no es contacto

  const successState = document.getElementById("successState");
  const sendAnother = document.getElementById("sendAnother");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.style.display = "none";
    successState.style.display = "flex";
  });

  sendAnother.addEventListener("click", () => {
    form.reset();
    successState.style.display = "none";
    form.style.display = "flex";
  });
}

/* ============================================
   5. INICIALIZACIÓN GENERAL
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Carrito (header en todas las páginas)
  renderCartUI();

  // Menú móvil
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
    });
  }

  // Carrito: abrir / cerrar
  document.querySelectorAll("[data-cart-open]").forEach((btn) =>
    btn.addEventListener("click", openCartDrawer)
  );
  document.getElementById("cartClose")?.addEventListener("click", closeCartDrawer);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCartDrawer);

  // Inicializaciones específicas de página (se autodetectan y no hacen nada
  // si los elementos correspondientes no existen en la página actual)
  initCatalogPage();
  initContactForm();
});