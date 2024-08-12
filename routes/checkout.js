const express = require('express');
const router = express.Router()
const cartServices = require('../services/cart_services')
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.get('/', async function(req,res){
    //get all items in cart
    const items = await cartServices.getCart(req.session.userId);
    //create line items 
    //payment order for cart
    const lineItems = [];
    for(let i of items) {
        const oneLineItem = { 
            quantity: i.get('quantity'),
            price_data: {
                currency: 'SGD',
                unit_amount: i.related('product').get('cost'),
                product_data: {
                    name:i.related('product').get('name'),
                    metadata: {
                        prooduct_id: i.get('product_id')
                    }
                }
            }
        }
        if (i.related('product').get('image_url')) {
            oneLineItem.price_data.product_data.images = [i.related('product').get('image_url')]
        }
        lineItems.push(oneLineItem)
    }
    

    //get session id from stripe
    const payment={
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        success_url: "https://www.google.com",
        cancel_url:"https://www.yahoo.com"
    }

    console.log(payment);

    const stripeSession = await Stripe.checkout.sessions.create(payment);
    //send session id back to hbs file

    res.render('checkout/index', {
        'sessionId': stripeSession.id,
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
})



router.post('/process_payment', express.raw({
    type: 'application/json'
}), async function(req, res) {
    const payload = req.body;
    const sigheader = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

    let event;
    try {
        // Construct the Stripe event using the signature and payload
        event = Stripe.webhooks.constructEvent(payload, sigheader, endpointSecret);

        // Log the entire event to verify its structure
        console.log(event);

        if (event.type === "checkout.session.completed") {
            const stripeSession = event.data.object;

            // Retrieve session with expanded line_items
            const session = await Stripe.checkout.sessions.retrieve(
                stripeSession.id, {
                    expand: ['line_items']
                }
            );

            // List line items with expanded product details
            const lineItems = await Stripe.checkout.sessions.listLineItems(stripeSession.id , {
                expand: ['data.price.product']
            });

            // Log each line item's product metadata
            for (let i of lineItems.price_data) {
                console.log(i.price.product.metadata)
            }

            res.send({
                'message': 'success'
            });
        } else {
            res.status(400).send({ 'error': 'Unexpected event type' });
        }
    } catch (error) {
        console.log('Error:', error.message);
        res.status(400).send({
            'error': error.message
        });
    }
});

module.exports = router;


module.exports = router