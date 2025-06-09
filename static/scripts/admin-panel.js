document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('categorySelect');
  const productList = document.getElementById('productsList');
  const selectedCategoryInput = document.getElementById('selectedCategory');

  async function loadProducts(category = 'all') {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/products');
      const data = await res.json();
      window.lastLoadedProducts = data;
      const filtered = category === 'all' ? data : data.filter(p => p.category === category);
      renderProducts(filtered);
    } catch (err) {
      console.error('❌ Завантаження товарів:', err);
      productList.innerHTML = '<p class="error">Не вдалося завантажити товари</p>';
    }
  }

  function renderProducts(products) {
    productList.innerHTML = '';

    if (products.length === 0) {
      productList.innerHTML = '<p>Немає товарів у цій категорії.</p>';
      return;
    }

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'admin-product-card';
      card.innerHTML = `
        <img src="/static/${product.image_url}" alt="${product.name}" />
        <div class="info">
          <h4>${product.name}</h4>
          <p>₴${product.price}</p>
          <p>${product.brand}</p>
          <p>Категорія: ${product.category}</p>
          <p>Рівень: ${product.level || '-'}</p>
          <p>Поверхня: ${product.surface || '-'}</p>
          <p>Тип: ${product.type_name || '-'}</p>
          <p>INT: ${product.size_int || '-'}</p>
          <p>Розмір взуття: ${product.shoe_size || '-'}</p>
          <p>Наявність: ${product.stock ? '✅' : '❌'}</p>
          <button class="edit-btn" data-id="${product.id}">Редагувати</button>
          <button class="delete-btn" data-id="${product.id}">🗑️ Видалити</button>
        </div>
      `;
      productList.appendChild(card);
    });

    document.querySelectorAll('.edit-btn').forEach(btn =>
      btn.addEventListener('click', handleEdit)
    );

    document.querySelectorAll('.delete-btn').forEach(btn =>
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('❗ Ви впевнені, що хочете видалити цей товар?')) {
          try {
            const res = await fetch(`http://127.0.0.1:5000/api/products/${id}`, {
              method: 'DELETE'
            });
            res.ok ? loadProducts(select.value) : alert('❌ Помилка при видаленні товару');
          } catch (err) {
            alert('❌ Сервер не відповідає');
          }
        }
      })
    );
  }

  function handleEdit(e) {
    const id = parseInt(e.target.dataset.id);
    const product = window.lastLoadedProducts.find(p => p.id === id);
    if (!product) return alert('❌ Неможливо знайти товар');

    const card = e.target.closest('.admin-product-card');
    card.innerHTML = `
      <div class="edit-form">
        <label>Назва: <input type="text" class="edit-name" value="${product.name}"></label>
        <label>Ціна: <input type="number" class="edit-price" value="${product.price}"></label>
        <label>Бренд: <input type="text" class="edit-brand" value="${product.brand}"></label>
        <label>Категорія: <input type="text" class="edit-category" value="${product.category}"></label>
        <label>Рівень: <input type="text" class="edit-level" value="${product.level || ''}"></label>
        <label>Поверхня: <input type="text" class="edit-surface" value="${product.surface || ''}"></label>
        <label>Тип товару: <input type="text" class="edit-type-name" value="${product.type_name || ''}"></label>
        <label>INT розмір: <input type="text" class="edit-size-int" value="${product.size_int || ''}"></label>
        <label>Розмір взуття: <input type="text" class="edit-shoe-size" value="${product.shoe_size || ''}"></label>
        <label>Зображення: <input type="text" class="edit-image-url" value="${product.image_url}"></label>
        <label><input type="checkbox" class="edit-stock" ${product.stock ? 'checked' : ''}> В наявності</label>
        <button class="save-edit" data-id="${product.id}">💾 Зберегти</button>
        <button class="cancel-edit">❌ Скасувати</button>
      </div>
    `;

    card.querySelector('.save-edit').addEventListener('click', async () => {
      const updated = {
        name: card.querySelector('.edit-name').value,
        price: parseFloat(card.querySelector('.edit-price').value),
        brand: card.querySelector('.edit-brand').value,
        category: card.querySelector('.edit-category').value,
        level: card.querySelector('.edit-level').value,
        surface: card.querySelector('.edit-surface').value,
        type_name: card.querySelector('.edit-type-name').value,
        size_int: card.querySelector('.edit-size-int').value,
        shoe_size: card.querySelector('.edit-shoe-size').value,
        image_url: card.querySelector('.edit-image-url').value,
        stock: card.querySelector('.edit-stock').checked
      };

      try {
        const res = await fetch(`http://127.0.0.1:5000/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        res.ok ? loadProducts(select.value) : alert('❌ Не вдалося зберегти');
      } catch (err) {
        alert('❌ Сервер не відповідає');
      }
    });

    card.querySelector('.cancel-edit').addEventListener('click', () => loadProducts(select.value));
  }

  document.getElementById('add-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    const product = {
      name: form.name.value,
      brand: form.brand.value,
      level: form.level.value,
      surface: form.surface.value,
      price: parseFloat(form.price.value),
      image_url: form.image_url.value
        .replace(/^static[\\/]+/, '')  // удаляет static/ в начале
        .replace(/^\/+/, '')           // удаляет слэш в начале (если есть)
        .replace(/\\/g, '/'),           // Windows слэши → /
      shoe_size: form.shoe_size.value,
      size_int: form.size_int.value,
      type_name: form.type_name.value,
      stock: form.stock.checked,
      category: selectedCategoryInput.value
    };

    try {
      const res = await fetch('http://127.0.0.1:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        form.reset();
        loadProducts(select.value);
      } else {
        alert('❌ Не вдалося додати товар');
      }
    } catch (err) {
      alert('❌ Сервер не відповідає');
    }
  });

  select.addEventListener('change', e => {
    selectedCategoryInput.value = e.target.value;
    loadProducts(e.target.value);
  });

  loadProducts();
});