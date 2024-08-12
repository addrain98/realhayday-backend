const { Category, UOM, Product } = require("../models");

async function getAllProducts() {
    return await Product.fetchAll();
}

async function getAllCategories() {
    const allCategories = await Category.fetchAll()
        .map(category => [category.get('id'), category.get('name')]);
    return allCategories;
}

async function getAllUoms() {
    const allUoms = await UOM.fetchAll()
        .map(uom => [uom.get('id'), uom.get('name')]);
    return allUoms;
}

async function getProductById(productId) {
    const product = await Product.where({
        'id': productId
    }).fetch({
        withRelated: ['uom', 'categories'],
        require: false
    });

    return product;

}

async function createProduct(productData) {
    const product = new Product();
    product.set('name', productData.name);
    product.set('cost', productData.cost);
    product.set('product_specs', productData.product_specs);
    product.set('uom_id', productData.uom_id);
    product.set('image_url', productData.image_url);

    // save the product first so we use its product
    await product.save();
    return product;
}

module.exports = {
    getAllProducts,
    getAllUoms,
    getAllCategories,
    getProductById,
    createProduct
}