const bookshelf = require('../bookshelf')

const Product = bookshelf.model('Product', {
    tableName:'products'
});
const Category = bookshelf.model('Category',{
    tableName: 'categories'
})

const UOM = bookshelf.model('UOM',{
    tableName: 'uoms'
})
module.exports = { Product, Category, UOM };