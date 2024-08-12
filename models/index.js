const bookshelf = require('../bookshelf');

const Product = bookshelf.model('Product', {
    tableName: 'products',
    uom: function() {
        return this.belongsTo('UOM');
    },
    categories: function() {
        return this.belongsToMany('Category', 'products_categories', 'product_id', 'category_id');
    },
    cartItems:function() {
        return this.hasMany('CartItem');
      }
});

const Category = bookshelf.model('Category', {
    tableName: 'categories',
    products: function() {
        return this.belongsToMany('Product', 'products_categories', 'category_id', 'product_id');
    }
});

const UOM = bookshelf.model('UOM', {
    tableName: 'uoms',
    products: function() {
        return this.belongsToMany('Product');
    }
});

const User = bookshelf.model('User', {
    tableName: 'users'
})

const CartItem = bookshelf.model("CartItem", {
    tableName: "cart_items",
    product() {
        return this.belongsTo('Product')
    }
})
module.exports = { Product, UOM, Category, User, CartItem };