const cartDataLayer = require('../dal/cart')

async function addToCart(userId, productId, quantity) {
    //ideas for business logic
    //1. check if there's enough stock
    //2. check if the user has met maximum quota
    //3. discount code or dscount coupon
    //4. retargeting, sending user reminder email
    try {
        const cartItem = await cartDataLayer.getCartItemByUserAndProduct(userId, productId);
        if (!cartItem) {
            // if the user already have, get the existing item and increases its quantity by 1
            await cartDataLayer.createCartItem(userId, productId, quantity);
        } else {
            console.log(`Updating existing cart item for user ${userId}, product ${productId}, by quantity ${quantity}`);
            await cartDataLayer.updateQuantity(userId, productId, 1);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}
async function getCart(userId) {
    try {
        if (!userId) {
            throw new Error('User ID is required to fetch cart items.');
        }
        return await cartDataLayer.getCart({ userId });
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

async function removeFromCart(userId, productId){
    return await cartDataLayer.removeFromCart(userId, productId)
}

async function updateCartQuantity(userId, productId, quantity) {
    return await cartDataLayer.updateQuantity(userId, productId, quantity);
}

module.exports = { addToCart, getCart, removeFromCart, updateCartQuantity }