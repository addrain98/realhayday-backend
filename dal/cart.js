const { CartItem } = require('../models');

/**
 * Fetches the cart items for a given user.
 * @param {Object} param - An object containing the userId.
 * @param {int} param.userId - The ID of the user.
 * @returns {Promise<Object>} A bookshelf model that represents the CartItem collection.
 */
const getCart = async ({ userId }) => {
    if (!userId) {
        throw new Error('User ID is required to fetch cart items.');
    }

    try {
        return await CartItem.collection()
            .where({ user_id: userId })
            .fetch({
                require: false,
                withRelated: [
                    'product',
                    'product.uom',
                    'product.categories'
                ]
            });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        throw error;
    }
};

/**
 * Fetches a specific cart item by user ID and product ID.
 * @param {int} userId - The ID of the user.
 * @param {int} productId - The ID of the product.
 * @returns {Promise<Object>} A bookshelf model that represents the CartItem.
 */
const getCartItemByUserAndProduct = async (userId, productId) => {
    if (!userId || !productId) {
        throw new Error('Both user ID and product ID are required to fetch a cart item.');
    }

    try {
        return await CartItem.where({
            'user_id': userId,
            'product_id': productId
        }).fetch({
            require: false
        });
    } catch (error) {
        console.error('Error fetching cart item:', error);
        throw error;
    }
};

/**
 * Creates a new cart item.
 * @param {int} userId - The ID of the user.
 * @param {int} productId - The ID of the product.
 * @param {int} quantity - The quantity of the product.
 * @returns {Promise<Object>} A bookshelf model that represents the newly created CartItem.
 */
async function createCartItem(userId, productId, quantity) {
    if (!userId || !productId || !quantity) {
        throw new Error('User ID, product ID, and quantity are required to create a cart item.');
    }

    try {

        const cartItem = new CartItem({
            user_id: userId,
            product_id: productId,
            quantity: quantity
        });
        await cartItem.save();
        return cartItem;
    } catch (error) {
        console.error('Error creating cart item:', error);
        throw error;
    }
}

module.exports = { getCart, getCartItemByUserAndProduct, createCartItem };