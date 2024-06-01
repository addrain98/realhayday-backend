const express = require("express");
const router = express.Router();

// #1 import in the Product model
const { Product } = require('../models');
const { UOM } = require('../models')
const { createProductForm } = require("../forms");
const { bootstrapField } = require("../forms");
router.get('/', async (req, res) => {
    // #2 - fetch all the products (ie, SELECT * from products)
    let products = await Product.collection().fetch({
        withRelated: ['uom']
    });
    res.render('products/index', {
        products: products.toJSON() // #3 - convert collection to JSON
    })
})
router.get('/create', async function (req, res) {
    //conduct a mapping
    //for each category, return an array with 2 element( index 0 is id, index 1 is name)
    const allUoms = await UOM.fetchAll().map(uom => [uom.get('id'), `${uom.get('name')}, ${uom.get('description')}`])
    //create an instance of the form
    const productForm = createProductForm(allUoms)
    res.render('products/create', {
        form: productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async function (req, res) {
    const allUoms = await UOM.fetchAll().map(uom => [uom.get('id'), `${uom.get('name')}, ${uom.get('description')}`]);
    const productForm = createProductForm(allUoms);
    productForm.handle(req, {
        "success": async function (form) {
            //extract info submitted in the form
            //info is new product
            //to create instances of the model = create new row
            const product = new Product();
            product.set('name', form.data.name)
            product.set('cost', form.data.cost)
            product.set('product_specs', form.data.product_specs)
            product.set('uom_id', form.data.uom_id)
            //save 
            await product.save()
            res.redirect('/products')
        },
        "error": function (form) {
            res.render('products/create', {
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": function (form) {
            res.render('products/create', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/update', async function (req, res) {
    //get item
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    }); //add try catch later pls to catch exception
    const allUoms = await UOM.fetchAll().map(uom => [uom.get('id'), `${uom.get('name')}, ${uom.get('description')}`])
    //create form
    const productForm = createProductForm(allUoms);
    productForm.fields.name.value = product.get('name')
    productForm.fields.cost.value = product.get('cost')
    productForm.fields.product_specs.value = product.get('product_specs')

    res.render('products/update', {
        form: productForm.toHTML(bootstrapField)
    })
})

router.post('/:product_id/update', async function (req, res) {
    const allUoms = await UOM.fetchAll().map(uom => [uom.get('id'), `${uom.get('name')}, ${uom.get('description')}`])
    const productForm = createProductForm(allUoms);
    const product = await Product.where({
        id: req.params.product_id
    }).fetch({
        require: true
    })
    productForm.handle(req, {
        "success": async function (form) {
            // product.set('name', form.data.name)
            // product.set('cost', form.data.cost)
            // product.set('product_specs', form.data.product_specs) 
            //shortform
            product.set(form.data);
            await product.save()
            res.redirect('/products')
        },
        "error": async function (form) {
            res.render('products/update', {
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": async function (form) {
            res.render('products/update', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/delete', async function (req, res) {
    try {
        // Get item
        const product = await Product.where({
            'id': req.params.product_id
        }).fetch({
            require: true
        });

        res.render('products/delete', {
            product: product.toJSON()
        });
    } catch (err) {
        console.error(err);
        res.redirect('/products'); // Redirect or handle the error as needed
    }
});

router.post('/:product_id/delete', async function (req, res) {
    try {
        const product = await Product.where({
            'id': req.params.product_id
        }).fetch({
            require: true
        });
        await product.destroy();
        res.redirect("/products");
    } catch (err) {
        console.error(err);
        res.redirect('/products'); // Redirect or handle the error as needed
    }
});

module.exports = router;