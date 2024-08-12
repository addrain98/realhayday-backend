const express = require('express')
const router = express.Router();

const productDataLayer = require('../../dal/products');
const { createProductForm } = require('../../forms');


router.get('/', async function(req,res) {
    const allProducts = await productDataLayer.getAllProducts();
    res.json({
        'products': allProducts.toJSON()
    })
});

router.post('/',async function(req,res){
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async function(form){
            const { categories, ...productData } = form.data;
            const product = await productDataLayer.createProduct(productData)
            if (categories) {
                await product.categories().attach(categories.split(","));
            }
            res.json({
                product: product.toJSON()
            })
        },
        'empty': function() {
            res.sendStatus(401)
        },
        'error': function(form) {
            let errors = {};
            for (let key in form.fields) {
                const error = form.fields[key].error;
                if(error) {
                    errors[key]=error
                }
            }
            res.json({
                'errors': errors
            })
        }
        
    })
})

module.exports = router;