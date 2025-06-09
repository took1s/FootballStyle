// universal-filter.js
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.boot-grid');
  const brandButtons = document.querySelectorAll('.brand-filter');
  const stockRadios = document.querySelectorAll('input[name="availability"]');
  const minPriceInput = document.getElementById('min-price');
  const maxPriceInput = document.getElementById('max-price');
  const levelButtons = document.querySelectorAll('.level-filters button');
  const surfaceButtons = document.querySelectorAll('.surface-filters button');
  const sizeButtons = document.querySelectorAll('.size-filters button');
  const typeRadios = document.querySelectorAll('input[name="type"]');
  const sortSelect = document.getElementById('sortSelect');
  const paginationContainer = document.getElementById('pagination');

  const page = window.location.pathname.split('/').pop();
  const category = page.replace('.html', '');

  let allCards = [];
  let selectedBrand = null;
  let selectedLevel = null;
  let selectedSurface = null;
  let selectedSizes = [];
  let selectedType = null;
  let currentPage = 1;
  const itemsPerPage = 12;

  fetch(`/api/products?category=${category}`)
    .then(res => res.json())
    .then(products => {
      allCards = products.map(createCard);
      renderCards();
    });

  function createCard(product) {
    const card = document.createElement('div');
    card.classList.add('boot-card');
    card.dataset.brand = product.brand.toLowerCase();
    card.dataset.level = product.level || '';
    card.dataset.surface = product.surface || '';
    card.dataset.stock = product.stock;
    card.dataset.price = product.price;
    card.dataset.size = (product.size_int || product.shoe_size || '').toLowerCase();
    card.dataset.type = product.type_name || '';

    card.innerHTML = `
      <img src="/static/${product.image_url}" alt="product">
      <p>${product.name}</p>
      <span>₴${product.price}</span>
      <button>До кошика</button>
    `;
    return card;
  }

  function getFilteredCards() {
    const selectedAvailability = document.querySelector('input[name="availability"]:checked')?.value;
    const minPrice = parseInt(minPriceInput?.value) || 0;
    const maxPrice = parseInt(maxPriceInput?.value) || 99999;

    return allCards.filter(card => {
      const brand = card.dataset.brand;
      const level = card.dataset.level;
      const surface = card.dataset.surface;
      const stock = card.dataset.stock === 'true';
      const price = parseInt(card.dataset.price);
      const sizes = card.dataset.size.split(',').map(s => s.trim().toLowerCase());
      const type = card.dataset.type;

      const matchBrand = selectedBrand ? brand === selectedBrand : true;
      const matchLevel = selectedLevel ? level === selectedLevel : true;
      const matchSurface = selectedSurface ? surface === selectedSurface : true;
      const matchType = selectedType ? type === selectedType : true;
      const matchSize = selectedSizes.length > 0 ? selectedSizes.some(size => sizes.includes(size)) : true;
      const matchStock = selectedAvailability === 'in-stock' ? stock :
                         selectedAvailability === 'out-of-stock' ? !stock : true;
      const matchPrice = price >= minPrice && price <= maxPrice;

      return matchBrand && matchLevel && matchSurface && matchStock && matchPrice && matchSize && matchType;
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

  sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const value = button.dataset.size.toLowerCase();
      if (selectedSizes.includes(value)) {
        selectedSizes = selectedSizes.filter(s => s !== value);
        button.classList.remove('active');
      } else {
        selectedSizes.push(value);
        button.classList.add('active');
      }
      renderCards(1);
    });
  });

  typeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      selectedType = radio.checked ? radio.value : null;
      renderCards(1);
    });
  });

  stockRadios.forEach(radio => radio.addEventListener('change', () => renderCards(1)));
  minPriceInput?.addEventListener('input', () => renderCards(1));
  maxPriceInput?.addEventListener('input', () => renderCards(1));
  sortSelect?.addEventListener('change', () => renderCards(currentPage));
});
