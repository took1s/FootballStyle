from datetime import datetime
from backend import db
from flask import url_for

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    brand = db.Column(db.String(50))
    level = db.Column(db.String(50))
    surface = db.Column(db.String(50))
    stock = db.Column(db.Boolean)
    price = db.Column(db.Integer)
    image_url = db.Column(db.String(500))

    category = db.Column(db.String(50))      
    size_int = db.Column(db.String(10))      
    type_name = db.Column(db.String(50)) 
    shoe_size = db.Column(db.String(20))    

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'level': self.level,
            'surface': self.surface,
            'stock': self.stock,
            'price': self.price,
            'image_url': self.image_url,  
            'category': self.category,
            'size_int': self.size_int,
            'type_name': self.type_name,
            'shoe_size': self.shoe_size
        }

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    product_id = db.Column(db.Integer)
    quantity = db.Column(db.Integer)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    address = db.Column(db.String(255))
    items = db.Column(db.Text)  
    date = db.Column(db.DateTime, default=datetime.utcnow)