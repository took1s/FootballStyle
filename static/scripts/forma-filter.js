document.addEventListener('DOMContentLoaded', () => {
    const formaCards = Array.from(document.querySelectorAll('.forma-card'));
    const brandButtons = document.querySelectorAll('.brand-filter');
    const stockRadios = document.querySelectorAll('input[name="availability"]');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const sizeButtons = document.querySelectorAll('.size-filters button');
    const sortSelect = document.getElementById('sortSelect');
    const container = document.querySelector('.boot-grid');
    const paginationContainer = document.getElementById('pagination');
    const typeRadios = document.querySelectorAll('input[name="type"]');
  
    let selectedType = null;
    let selectedBrand = null;
    let selectedSize = null;
    let currentPage = 1;
    const itemsPerPage = 12;
  
    function getFilteredCards() {
      const selectedAvailability = document.querySelector('input[name="availability"]:checked')?.value;
      const minPrice = parseInt(minPriceInput.value) || 0;
      const maxPrice = parseInt(maxPriceInput.value) || 99999;
  
      return formaCards.filter(card => {
        const cardBrand = card.dataset.brand?.toLowerCase();
        const cardStock = card.dataset.stock === 'true';
        const cardPrice = parseInt(card.dataset.price);
        const cardSize = card.dataset.size;
        const cardType = card.dataset.type;
  
        const matchBrand = selectedBrand ? cardBrand === selectedBrand : true;
        const matchStock =
          selectedAvailability === 'in-stock' ? cardStock :
          selectedAvailability === 'out-of-stock' ? !cardStock : true;
        const matchPrice = cardPrice >= minPrice && cardPrice <= maxPrice;
        const matchSize = selectedSize
          ? cardSize?.split(',').includes(selectedSize)
          : true;
        const matchType = selectedType ? cardType === selectedType : true;
  
        return matchBrand && matchStock && matchPrice && matchSize && matchType;
      });
    }
  
    function renderCards(page = 1) {
      currentPage = page;
      const filteredCards = getFilteredCards();
  
      // сортировка
      const sortValue = sortSelect.value;
      const sortedCards = [...filteredCards].sort((a, b) => {
        const priceA = parseInt(a.dataset.price);
        const priceB = parseInt(b.dataset.price);
        if (sortValue === 'price-asc') return priceA - priceB;
        if (sortValue === 'price-desc') return priceB - priceA;
        return 0;
      });
  
      // пагинация
      const totalPages = Math.ceil(sortedCards.length / itemsPerPage);
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedCards = sortedCards.slice(start, end);
  
      container.innerHTML = '';
      paginatedCards.forEach(card => container.appendChild(card));
  
      renderPagination(totalPages, page);
    }
  
    function renderPagination(totalPages, currentPage) {
      paginationContainer.innerHTML = '';
  
      for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.add('page-btn');
        if (i === currentPage) pageBtn.classList.add('active');
  
        pageBtn.addEventListener('click', () => {
          renderCards(i);
        });
  
        paginationContainer.appendChild(pageBtn);
      }
    }
  
    // === ФИЛЬТРЫ ===
    brandButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectedBrand = selectedBrand === button.dataset.brand ? null : button.dataset.brand;
        brandButtons.forEach(btn => btn.classList.remove('active'));
        if (selectedBrand) button.classList.add('active');
        renderCards(1); // сбрасываем на первую страницу
      });
    });
  
    stockRadios.forEach(radio => {
      radio.addEventListener('change', () => renderCards(1));
    });
  
    minPriceInput.addEventListener('input', () => renderCards(1));
    maxPriceInput.addEventListener('input', () => renderCards(1));
  
    sizeButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectedSize = selectedSize === button.dataset.size ? null : button.dataset.size;
        sizeButtons.forEach(btn => btn.classList.remove('active'));
        if (selectedSize) button.classList.add('active');
        renderCards(1);
      });
    });
  
    sortSelect.addEventListener('change', () => renderCards(currentPage));
  
    // Переключение фильтров (+/-)
    document.querySelectorAll('.filter-header').forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        content.classList.toggle('hidden');
        const toggle = header.querySelector('.toggle');
        toggle.textContent = content.classList.contains('hidden') ? '+' : '−';
      });
    });
  
    renderCards(); // первичный рендер

    typeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        selectedType = radio.value;
        renderCards(1);
      });
    });
  });

