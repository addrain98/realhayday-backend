const express = require("express");
const router = express.Router();

// #1 import in the Product model
const { Product, UOM, Category } = require('../models');
const { createProductForm, bootstrapField, createSearchForm } = require("../forms");
const { checkifAuthenticated } = require('../middlewares');
const { getAllUoms, getAllCategories, getProductById, createProduct } = require('../dal/products')

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
router.get('/create', [checkifAuthenticated], async function (req, res) {
    //conduct a mapping
    //for each category, return an array with 2 element( index 0 is id, index 1 is name)
    try {
        const allUoms = await getAllUoms()
        const Categories = await getAllCategories()
        const productForm = createProductForm(allUoms, Categories)
        res.render('products/create', {
            form: productForm.toHTML(bootstrapField),
            cloudinaryName: process.env.CLOUDINARY_NAME,
            cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
            cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
        })
    } catch (err) {
        console.error('Error fetching UOMs or Categories:', err);
        res.status(500).json({ error: 'An error occurred while fetching UOMs or Categories' });
    }
})

router.post('/create', async function (req, res) {
    try {
        // Fetch all UOMs and Categories
        const allUoms = await getAllUoms()
        const Categories = await getAllCategories()

        // Create the product form
        const productForm = createProductForm(allUoms, Categories);

        // Handle the form submission
        productForm.handle(req, {
            "success": async function (form) {
                try {
                    // Create a new product instance
                    const product = await createProduct(form.data)
                    // Save the product to get the product_id
                    await product.save();

                    // Attach categories to the product
                    let categories = form.data.categories
                    // the tags will be in comma delimited form
                    // so for example if the user selects ID 3, 5 and 6
                    // then form.data.tags will be "3,5,6"
                    if (categories) {
                        await product.categories().attach(categories.split(','));
                    }
                    // Set flash message and redirect
                    req.flash('success_messages', 'New product has been added');
                    res.redirect('/products');
                } catch (err) {
                    console.error('Error saving product:', err);
                    res.status(500).json({ error: 'An error occurred while saving the product' });
                }
            },
            "error": function (form) {
                res.render('products/create', {
                    form: form.toHTML(bootstrapField),
                    cloudinaryName: process.env.CLOUDINARY_NAME,
                    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                    cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
                });
            },
            "empty": function (form) {
                res.render('products/create', {
                    form: form.toHTML(bootstrapField),
                    cloudinaryName: process.env.CLOUDINARY_NAME,
                    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                    cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
                });
            }
        });
    } catch (err) {
        console.error('Error fetching UOMs or Categories:', err);
        res.status(500).json({ error: 'An error occurred while fetching UOMs or Categories' });
    }
});

router.get('/:product_id/update', [checkifAuthenticated], async function (req, res) {
    //get item
    const product = await getProductById(req.params.product_id)
    if (!product) {
        req.flash('error_messages', "Product does not exist")
        res.redirect('/')
        return
    }
    const allUoms = await getAllUoms()
    const Categories = await getAllCategories()
    //create form
    const productForm = createProductForm(allUoms, Categories);
    productForm.fields.name.value = product.get('name')
    productForm.fields.cost.value = product.get('cost')
    productForm.fields.product_specs.value = product.get('product_specs')
    productForm.fields.uom_id.value = product.get('uom_id')
    productForm.fields.image_url.value = product.get('image_url')

    //get all selected categories
    const selectedCategories = await product.related('categories').pluck('id')
    productForm.fields.categories.value = selectedCategories

    res.render('products/update', {
        form: productForm.toHTML(bootstrapField),
        product: product.toJSON(),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    });
})

router.post('/:product_id/update', async function (req, res) {
    const product = await getProductById(req.params.product_id)
    if (!product) {
        req.flash('error_messages', "Product does not exist")
        res.redirect('/')
        return
    }
    const allUoms = await getAllUoms()
    const Categories = await getAllCategories()
    const productForm = createProductForm(allUoms, Categories);
    productForm.handle(req, {
        "success": async function (form) {
            // product.set('name', form.data.name)
            // product.set('cost', form.data.cost)
            // product.set('product_specs', form.data.product_specs) 
            //shortform
            //basically splitting categories data from product data and trabsferring them to categories
            let { categories, ...productData } = form.data;
            product.set(productData)
            await product.save()

            //update M:N relationship with categories
            let categoriesIds = categories.split(',');

            //get and remove all existing categories
            const existingCategoriesId = await product.related('categories').pluck('id');
            await product.categories().detach(existingCategoriesId)

            await product.categories().attach(categoriesIds)
            res.redirect('/products')
        },
        "error": async function (form) {
            res.render('products/update', {
                form: form.toHTML(bootstrapField),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        },
        "empty": async function (form) {
            res.render('products/update', {
                form: form.toHTML(bootstrapField),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        }
    })
})

router.get('/:product_id/delete', [checkifAuthenticated], async function (req, res) {
    try {
        // Get item
        const product = await getProductById(req.params.product_id)
        if (!product) {
            req.flash('error_messages', "Product does not exist")
            res.redirect('/')
            return
        }

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
        const product = await getProductById(req.params.product_id)
        if (!product) {
            req.flash('error_messages', "Product does not exist")
            res.redirect('/')
            return
        }
        await product.destroy();
        req.flash("success_messages", "Product has been deleted.")
        res.redirect("/products");
    } catch (err) {
        console.error(err);
        res.redirect('/products'); // Redirect or handle the error as needed
    }
});

module.exports = router;