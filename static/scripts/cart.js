// Универсальная функция добавления товара
function setupCartListeners() {
  const cards = document.querySelectorAll(
    '.boot-card, .forma-card, .ball-card, .accessory-card, .goalkeeper-card, .training-card, .inventory-card'
  );

  cards.forEach(card => {
    const button = card.querySelector('button');

    if (!button) return;

    button.addEventListener('click', () => {
      const title = card.querySelector('p')?.innerText?.trim();
      const price = parseInt(card.dataset.price);
      const image = card.querySelector('img')?.src || '';
      const brand = card.dataset.brand || '';

      if (!title || isNaN(price)) {
        alert('❌ Неможливо додати товар: відсутні дані');
        return;
      }

      const product = { title, price, image, brand };

      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart.push(product);
      localStorage.setItem('cart', JSON.stringify(cart));

      alert('✅ Товар додано в кошик!');
    });
  });
}

// Если товары загружаются через fetch — нужно дождаться
document.addEventListener('DOMContentLoaded', () => {
  // Если на странице товары уже есть — подключаем сразу
  setupCartListeners();

  // Если товары загружаются через fetch, подожди 1 сек и проверь снова
  setTimeout(() => {
    setupCartListeners(); // второй раз, на случай поздней отрисовки
  }, 1000);
});