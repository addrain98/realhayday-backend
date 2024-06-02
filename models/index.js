const bookshelf = require('../bookshelf');

const Product = bookshelf.model('Product', {
    tableName: 'products',
    uom: function() {
        return this.belongsTo('UOM');
    },
    categories: function() {
        return this.belongsToMany('Category', 'products_categories', 'product_id', 'category_id');
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

module.exports = { Product, UOM, Category };