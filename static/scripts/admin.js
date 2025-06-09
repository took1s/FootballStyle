document.getElementById('product-form').addEventListener('submit', e => {
  e.preventDefault();

  const form = e.target;
  const product = {
    name: form.name.value,
    brand: form.brand.value.toLowerCase(),
    level: form.level.value.toLowerCase(),
    surface: form.surface.value.toLowerCase(),
    price: parseInt(form.price.value),
    image_url: form.image_url.value,
    stock: form.stock.value === 'true'
  };

  fetch('/api/products', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(product)
  }).then(res => {
    if (res.ok) {
      alert('Товар додано!');
      form.reset();
    } else {
      alert('Помилка при додаванні товару.');
    }
  });
});