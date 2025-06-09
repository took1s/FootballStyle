document.addEventListener('DOMContentLoaded', () => {
    const equipmentCards = Array.from(document.querySelectorAll('.equipment-card'));
    const brandButtons = document.querySelectorAll('.brand-filter');
    const stockRadios = document.querySelectorAll('input[name="availability"]');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const sortSelect = document.getElementById('sortSelect');
    const container = document.querySelector('.boot-grid');
    const paginationContainer = document.getElementById('pagination');
  
    let selectedBrand = null;
    let currentPage = 1;
    const itemsPerPage = 12;
  
    function getFilteredCards() {
      const selectedAvailability = document.querySelector('input[name="availability"]:checked')?.value;
      const minPrice = parseInt(minPriceInput.value) || 0;
      const maxPrice = parseInt(maxPriceInput.value) || 99999;
  
      return equipmentCards.filter(card => {
        const cardBrand = card.dataset.brand?.toLowerCase();
        const cardStock = card.dataset.stock === 'true';
        const cardPrice = parseInt(card.dataset.price);
  
        const matchBrand = selectedBrand ? cardBrand === selectedBrand : true;
        const matchStock =
          selectedAvailability === 'in-stock' ? cardStock :
          selectedAvailability === 'out-of-stock' ? !cardStock : true;
        const matchPrice = cardPrice >= minPrice && cardPrice <= maxPrice;
  
        return matchBrand && matchStock && matchPrice;
      });
    }
  
    function renderCards(page = 1) {
      currentPage = page;
      const filteredCards = getFilteredCards();
  
      const sortValue = sortSelect?.value || 'default';
      const sortedCards = [...filteredCards].sort((a, b) => {
        const priceA = parseInt(a.dataset.price);
        const priceB = parseInt(b.dataset.price);
        if (sortValue === 'price-asc') return priceA - priceB;
        if (sortValue === 'price-desc') return priceB - priceA;
        return 0;
      });
  
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
  
    stockRadios.forEach(radio => radio.addEventListener('change', () => renderCards(1)));
    minPriceInput.addEventListener('input', () => renderCards(1));
    maxPriceInput.addEventListener('input', () => renderCards(1));
    sortSelect?.addEventListener('change', () => renderCards(currentPage));
  
    // Разворачивание/сворачивание
    document.querySelectorAll('.filter-header').forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        content.classList.toggle('hidden');
        const toggle = header.querySelector('.toggle');
        toggle.textContent = content.classList.contains('hidden') ? '+' : '−';
      });
    });
  
    renderCards();
  });