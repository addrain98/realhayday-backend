const express = require('express');
const router = express.Router()
const { getAllUoms, getAllCategories } = require('../dal/products')
const { bootstrapField, createSearchForm } = require("../forms");
const { Product, UOM, Category } = require('../models');

router.get('/', async function (req, res) {
    const allUoms = await getAllUoms()
    allUoms.unshift([0, '--------'])
    const Categories = await getAllCategories()
    const searchForm = createSearchForm(Categories, allUoms);
    searchForm.handle(req, {
        "success": async function (form) {
            // fetch all the products (ie, SELECT * from products)
            // let products = await Product.collection()
            //     .where('name', 'like', `%${form.data.name}%`)
            //     .fetch({
            //         withRelated: ['uom', 'categories']
            //     });
            //we need an always tru query to select all parameters
            //eqv. SELECT * FROM products WHERE 1
            // this is known as query builder
            const q = Product.collection();

            if (form.data.name) {
                q.where('name', 'like', `%${form.data.name}%`)
            }
            if (form.data.price_range) {
                q.where('cost', '<=', form.data.price_range); // Ensure the correct field name is used
            }
            if (form.data.uom_id && form.data.uom_id != "0") {
                q.where('uom_id', '=', parseInt(form.data.uom_id))
            }

            if (form.data.categories) {
                q.query('join', 'products_categories', 'products.id', 'product_id')
                    .where('category_id', 'in', form.data.categories.split(','))
            }

            // Fetch products based on the query
            let products = await Product.collection().fetch({
                withRelated: ['uom', 'categories']
            });
            res.render('landing/index', {
                products: products.toJSON(), // #3 - convert collection to JSON
                form: form.toHTML(bootstrapField)
            })
        },
        "error": async function (form) {
            let products = await Product.collection().fetch({
                withRelated: ['uom', 'categories']
            });
            res.render('landing/index', {
                products: products.toJSON(), // #3 - convert collection to JSON
                form: searchForm.toHTML(bootstrapField)
            })

        },
        "empty": async function (form) {
            let products = await Product.collection().fetch({
                withRelated: ['uom', 'categories']
            });
            res.render('landing/index', {
                products: products.toJSON(), // #3 - convert collection to JSON
                form: searchForm.toHTML(bootstrapField)
            })
        }
    })
    if (req.session.visitCount) {
        req.session.visitCount++
    }
    else {
        req.session.visitCount = 1
    }

})

router.get('/admin', function (req, res) {
    res.render('landing/admin')
})

router.get('/about-us', function (req, res) {
    res.render('landing/about-us')
})

router.get('/contact', function (req, res) {
    res.render('landing/contact-us')
})

router.get('/', async (req, res) => {
    const allUoms = await getAllUoms()
    allUoms.unshift([0, '--------'])
    const Categories = await getAllCategories()
    const searchForm = createSearchForm(Categories, allUoms);

    searchForm.handle(req, {
        "success": async function (form) {
            // fetch all the products (ie, SELECT * from products)
            // let products = await Product.collection()
            //     .where('name', 'like', `%${form.data.name}%`)
            //     .fetch({
            //         withRelated: ['uom', 'categories']
            //     });
            //we need an always tru query to select all parameters
            //eqv. SELECT * FROM products WHERE 1
            // this is known as query builder
            const q = Product.collection();

            if (form.data.name) {
                q.where('name', 'like', `%${form.data.name}%`)
            }
            if (form.data.price_range) {
                q.where('cost', '<=', form.data.price_range); // Ensure the correct field name is used
            }
            if (form.data.uom_id && form.data.uom_id != "0") {
                q.where('uom_id', '=', parseInt(form.data.uom_id))
            }

            if (form.data.categories) {
                q.query('join', 'products_categories', 'products.id', 'product_id')
                    .where('category_id', 'in', form.data.categories.split(','))
            }

            // Fetch products based on the query
            let products = await Product.collection().fetch({
                withRelated: ['uom', 'categories']
            });
            res.render('products/index', {
                products: products.toJSON(), // #3 - convert collection to JSON
                form: form.toHTML(bootstrapField)
            })
        },
        "error": async function (form) {
            let products = await Product.collection().fetch({
                withRelated: ['uom', 'categories']
            });
            res.render('products/index', {
                products: products.toJSON(), // #3 - convert collection to JSON
                form: searchForm.toHTML(bootstrapField)
            })

        },
        "empty": async function (form) {
            let products = await Product.collection().fetch({
                withRelated: ['uom', 'categories']
            });
            res.render('products/index', {
                products: products.toJSON(), // #3 - convert collection to JSON
                form: searchForm.toHTML(bootstrapField)
            })
        }
    })
})
module.exports = router;
