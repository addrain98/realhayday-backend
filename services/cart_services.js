const cartDataLayer = require('../dal/cart')

async function addToCart(userId, productId, quantity) {
    //ideas for business logic
    //1. check if there's enough stock
    //2. check if the user has met maximum quota
    //3. discount code or dscount coupon
    //4. retargeting, sending user reminder email
    try {
        await cartDataLayer.createCartItem(userId, productId, quantity)
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
        console.log(`Fetching cart for userId=${userId}`);
        return await cartDataLayer.getCart({ userId });
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

module.exports = { addToCart, getCart }