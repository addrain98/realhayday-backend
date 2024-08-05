const express = require('express');
const router = express.Router();
const { checkifAuthenticated } = require('../middlewares');
const cartServices = require('../services/cart_services');

router.get('/', [checkifAuthenticated], async function (req, res) {
    // get the items from the shopping cart
    // note: in the lab sheet  it is req.session.user.id!
    const cartItems = await cartServices.getCart(req.session.userId);
    res.render('cart/index', {
        cartItems: cartItems.toJSON()
    })
})

router.get('/:product_id/add',[checkifAuthenticated], async function (req, res) {
    await cartServices.addToCart(req.session.userId, req.params.product_id, 1);
    req.flash('success_messages', "Add to shopping cart");
    res.redirect('/products');
})

router.get('/:product_id/remove', async function (req,res) {
    await cartServices.removeFromCart(req.session.userId, req.params.product_id)
    req.flash('success_messages', "Item removed successfully.");
    res.redirect('/cart')
})

router.post('/:product_id/updateCartQuantity', async function(req, res) {
    // Todo: Add validation here
    const newQuantity = parseInt(req.body.newQuantity);
    if (newQuantity <= 0) {
        req.flash("error_messages", "The product does not exist in the cart.");
        return res.redirect("/cart");
    }

    try {
        await cartServices.updateCartQuantity(
            req.session.userId,
            req.params.product_id,
            newQuantity
        );
        req.flash("success_messages", "Quantity updated successfully");
    } catch (error) {
        req.flash("error_messages", "An error occurred while updating the quantity.");
    }

    res.redirect("/cart");
});

module.exports = router;