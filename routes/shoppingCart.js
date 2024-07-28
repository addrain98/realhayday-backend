const express = require('express');
const router = express.Router()

const cartServices = require('../services/cart_services')

router.get('/', async function (req, res) {
    const cartItems = await cartServices.getCart(req.session.userId)
    res.render('cart/index', {
        cartItems: cartItems.JSON()
    })
})

router.get('/:product_id/add', async function (req, res) {
    await cartServices.addToCart(req.session.userId, req.params.product_id);
    res.flash('success_messages', "Add to shopping cart");
    res.redirect('/cart')
})


module.exports = router;