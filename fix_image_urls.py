from app import app
from backend import db
from backend.models import Product
import re

with app.app_context():
    products = Product.query.all()
    fixed = 0
    for p in products:
        path = p.image_url
        if path.startswith("static/"):
            path = path.replace("static/", "", 1)

        # Удаляем лишние / в начале
        path = re.sub(r'^\/+', '', path)

        # Удаляем множественные static
        path = re.sub(r'(static/)+', 'static/', path)

        # Удаляем повторный encode
        path = path.replace('%2520', '%20')\
                   .replace('%252F', '%2F')\
                   .replace('%255C', '%5C')

        if p.image_url != path:
            p.image_url = path
            fixed += 1

    db.session.commit()
    print(f"✅ Оновлено {fixed} товарів")