from flask import Flask, render_template, request, jsonify, url_for
from flask_cors import CORS
from backend import db
from backend.models import Product
import os
from backend.models import Order
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'backend', 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<page>')
def render_page(page):
    allowed_pages = [
        'index.html', 'about.html', 'delivery.html', 'categories.html',
        'boots.html', 'balls.html', 'accessories.html', 'forma.html',
        'goalkeeper.html', 'training.html', 'equipment.html',
        'cart.html', 'checkout.html', 'admin.html', 'admin-panel.html',
        'admin-orders.html'
    ]
    if page in allowed_pages:
        return render_template(page)
    return "Page not found", 404

# ====== API: PRODUCTS ======

@app.route('/admin')
def admin_panel():
    return render_template('admin-panel.html')

@app.route('/api/products', methods=['GET'])
def get_all_products():
    category = request.args.get('category')
    
    if category:
        products = Product.query.filter_by(category=category).all()
    else:
        products = Product.query.all()

    return jsonify([p.to_dict() for p in products])

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    new_product = Product(
        name=data.get('name'),
        brand=data.get('brand'),
        level=data.get('level'),
        surface=data.get('surface'),
        price=data.get('price'),
        stock=data.get('stock', True),
        image_url=data.get('image_url'),
        category=data.get('category'),
        type_name=data.get('type_name'),
        size_int=data.get('size_int'),
        shoe_size=data.get('shoe_size')
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Товар додано'}), 201

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    address = data.get('address')
    items = json.dumps(data.get('items', []))  # Сохраняем список как JSON

    new_order = Order(
        name=name,
        email=email,
        address=address,
        items=items,
        date=datetime.utcnow()
    )

    db.session.add(new_order)
    db.session.commit()

    return jsonify({'message': 'Замовлення створено'}), 201

@app.route('/api/orders', methods=['GET'])
def get_orders():
    orders = Order.query.order_by(Order.date.desc()).all()
    result = []

    for o in orders:
        result.append({
            'id': o.id,
            'name': o.name,
            'email': o.email,
            'address': o.address,
            'items': o.items,  # храним как JSON-строку
            'date': o.date.isoformat()
        })

    return jsonify(result)

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    order = Order.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    return jsonify({'message': 'Замовлення видалено'})

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.json
    product = Product.query.get_or_404(product_id)

    product.name = data['name']
    product.price = data['price']
    product.brand = data['brand']
    product.image_url = data['image_url']
    product.stock = data['stock']
    product.category = data['category']
    product.type_name = data.get('type_name', '')
    product.size_int = data.get('size_int', '')
    product.shoe_size = data.get('shoe_size', '')
    product.level = data.get('level', '')
    product.surface = data.get('surface', '')

    db.session.commit()
    return jsonify({'message': 'Updated'})

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Товар видалено'})

@app.route('/api/products/latest', methods=['GET'])
def get_latest_products():
    products = Product.query.order_by(Product.id.desc()).limit(4).all()
    result = [
        {
            'id': p.id,
            'name': p.name,
            'brand': p.brand,
            'level': p.level,
            'surface': p.surface,
            'stock': p.stock,
            'price': p.price,
            'image_url': url_for('static', filename=p.image_url)
        }
        for p in products
    ]
    return jsonify(result)

@app.route('/api/new-products', methods=['GET'])
def get_new_products():
    products = Product.query.order_by(Product.id.desc()).limit(10).all()
    result = []
    for p in products:
        result.append({
            'id': p.id,
            'title': p.name,
            'price': p.price,
            'brand': p.brand,
            'stock': p.stock,
            'image': url_for('static', filename=p.image_url)
        })
    return jsonify(result)

@app.route('/api/top-products', methods=['GET'])
def get_top_products():
    products = Product.query.order_by(Product.stock.asc()).limit(10).all()
    result = []
    for p in products:
        result.append({
            'id': p.id,
            'title': p.name,
            'price': p.price,
            'brand': p.brand,
            'stock': p.stock,
            'image': url_for('static', filename=p.image_url)
        })
    return jsonify(result)

# ====== Инициализация и запуск ======
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)