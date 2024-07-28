const cartDataLayer = require('../dal/cart')

async function addToCart( userId, productId, quantity) {
    await cartDataLayer.createCartItem (userId, productId, quantity)
}
async function getCart(userId) {
    return await cartDataLayer.getCart(userId)
}

module.exports = {addToCart, getCart}