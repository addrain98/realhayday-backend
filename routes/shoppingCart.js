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

router.get('/:product_id/add', async function (req, res) {
    await cartServices.addToCart(req.session.userId, req.params.product_id, 1);
    req.flash('success_messages', "Addd to shopping cart");
    res.redirect('/cart');
})

module.exports = router;