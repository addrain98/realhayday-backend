const bookshelf = require('../bookshelf')

const Product = bookshelf.model('Product', {
    tableName:'products',
    uom() {
        return this.belongsTo('UOM')
    }
});

const UOM = bookshelf.model('UOM',{
    tableName: 'uoms',
    products() {
        return this.hasMany('Product');
    }
})

module.exports = {Product, UOM};