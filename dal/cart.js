const { CartItem } = require('../models');
/**
 * 
 * @param {int} userId The ID of the user
 * @param {int} productId The ID of the product
 * @returns a bookshelf model that represents the CartItem
 */
const getCart = async ({ userId }) => {
    try {
        return await CartItem.collection()
            .where({
                user_id: userId
            }).fetch({
                require: false,
                withRelated: ['product', 'product.category']
            });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        throw error;
    }
};

const getCartItemByUserAndProduct = async (userId, productId) => {
    return await CartItem.where({
        'user_id': userId,
        'product_id': product_id
    }).fetch({
        require: false
    })
}

async function createCartItem(userId, productId, quantity) {
    const cartItem = new CartItem ({
        user_id: userId,
        product_id: productId,
        quantity:quantity
    })
    await cartItem.save();
    return cartItem
}

module.exports = { getCart, getCartItemByUserAndProduct, createCartItem };