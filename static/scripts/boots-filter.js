
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.boot-grid');
  const brandButtons = document.querySelectorAll('.brand-filter');
  const stockRadios = document.querySelectorAll('input[name="availability"]');
  const minPriceInput = document.getElementById('min-price');
  const maxPriceInput = document.getElementById('max-price');
  const levelButtons = document.querySelectorAll('.level-filters button');
  const surfaceButtons = document.querySelectorAll('.surface-filters button');
  const sortSelect = document.getElementById('sortSelect');
  const paginationContainer = document.getElementById('pagination');
  const page = window.location.pathname.split('/').pop();  // boots.html
  const category = page.replace('.html', '');              // "boots"

  let allCards = [];
  let selectedBrand = null;
  let selectedLevel = null;
  let selectedSurface = null;
  let currentPage = 1;
  const itemsPerPage = 12;

  // === 1. Загружаем товары с backend ===
  fetch('/api/products?category=boots')
    .then(res => res.json())
    .then(products => {
      allCards = products.map(product => createCard(product));
      renderCards();
    });

  // === 2. Создаём карточку товара ===
  function createCard(product) {
    const card = document.createElement('div');
    card.classList.add('boot-card');
    card.dataset.brand = product.brand.toLowerCase();
    card.dataset.level = product.level;
    card.dataset.surface = product.surface;
    card.dataset.stock = product.stock;
    card.dataset.price = product.price;

    card.innerHTML = `
      <img src="/static/${product.image_url}" alt="Boot">
      <p>${product.name}</p>
      <span>₴${product.price}</span>
      <button>До кошика</button>
    `;

    return card;
  }

  // === 3. Фильтрация и рендер ===
  function getFilteredCards() {
    const selectedAvailability = document.querySelector('input[name="availability"]:checked')?.value;
    const minPrice = parseInt(minPriceInput.value) || 0;
    const maxPrice = parseInt(maxPriceInput.value) || 99999;

    return allCards.filter(card => {
      const brand = card.dataset.brand;
      const level = card.dataset.level;
      const surface = card.dataset.surface;
      const stock = card.dataset.stock === 'true';
      const price = parseInt(card.dataset.price);

      const matchBrand = selectedBrand ? brand === selectedBrand : true;
      const matchLevel = selectedLevel ? level === selectedLevel : true;
      const matchSurface = selectedSurface ? surface === selectedSurface : true;
      const matchStock =
        selectedAvailability === 'in-stock' ? stock :
        selectedAvailability === 'out-of-stock' ? !stock : true;
      const matchPrice = price >= minPrice && price <= maxPrice;

      return matchBrand && matchLevel && matchSurface && matchStock && matchPrice;
    });
  }

  function renderCards(page = 1) {
    currentPage = page;
    const filtered = getFilteredCards();

    const sortValue = sortSelect?.value || 'default';
    const sorted = [...filtered].sort((a, b) => {
      const priceA = parseInt(a.dataset.price);
      const priceB = parseInt(b.dataset.price);
      if (sortValue === 'price-asc') return priceA - priceB;
      if (sortValue === 'price-desc') return priceB - priceA;
      return 0;
    });

    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    container.innerHTML = '';
    sorted.slice(start, end).forEach(card => container.appendChild(card));

    renderPagination(totalPages, page);
  }

  function renderPagination(totalPages, currentPage) {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.textContent = i;
      pageBtn.classList.add('page-btn');
      if (i === currentPage) pageBtn.classList.add('active');
      pageBtn.addEventListener('click', () => renderCards(i));
      paginationContainer.appendChild(pageBtn);
    }
  }

  // === 4. Обработчики ===
  brandButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedBrand = selectedBrand === button.dataset.brand ? null : button.dataset.brand;
      brandButtons.forEach(btn => btn.classList.remove('active'));
      if (selectedBrand) button.classList.add('active');
      renderCards(1);
    });
  });

  levelButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedLevel = selectedLevel === button.dataset.level ? null : button.dataset.level;
      levelButtons.forEach(btn => btn.classList.remove('active'));
      if (selectedLevel) button.classList.add('active');
      renderCards(1);
    });
  });

  surfaceButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedSurface = selectedSurface === button.dataset.surface ? null : button.dataset.surface;
      surfaceButtons.forEach(btn => btn.classList.remove('active'));
      if (selectedSurface) button.classList.add('active');
      renderCards(1);
    });
  });

  stockRadios.forEach(radio => radio.addEventListener('change', () => renderCards(1)));
  minPriceInput.addEventListener('input', () => renderCards(1));
  maxPriceInput.addEventListener('input', () => renderCards(1));
  sortSelect?.addEventListener('change', () => renderCards(currentPage));
});

// === ОБРАБОТКА ФОРМЫ ДОБАВЛЕНИЯ ТОВАРА ===
const form = document.getElementById('add-product-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const productData = {
    name: formData.get('name'),
    brand: formData.get('brand'),
    level: formData.get('level'),
    surface: formData.get('surface'),
    price: parseFloat(formData.get('price')),
    stock: formData.get('stock') === 'on',
    image_url: formData.get('image_url'),
    shoe_size: formData.get('shoe_size'),
    category: document.getElementById('categorySelect').value, // категория из селектора
    type_name: '',     // можно добавить поле в форму если нужно
    size_int: ''       // можно добавить поле в форму если нужно
  };

  try {
    const res = await fetch('http://127.0.0.1:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    if (res.ok) {
      form.reset();
      loadProducts();  // Обновим список
    } else {
      console.error('Помилка додавання товару');
    }
  } catch (err) {
    console.error('Помилка при запиті:', err);
  }
});