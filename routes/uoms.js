const express = require("express");
const router = express.Router();

const { UOM } = require('../models')
const { createUOMForm } = require("../forms");
const { bootstrapField } = require("../forms");

router.get('/', async (req, res) => {
    // #2 - fetch all the products (ie, SELECT * from products)
    let uoms = await UOM.collection().fetch();
    res.render('uoms/index', {
        uoms: uoms.toJSON() // #3 - convert collection to JSON
    })
})

router.get('/create', async function (req, res) {
    const uomForm = createUOMForm()
    res.render('uoms/create', {
        form: uomForm.toHTML(bootstrapField)
    })
})

router.post('/create', async function (req, res) {
    const uomForm = createUOMForm()
    
    uomForm.handle(req, {
        "success": async function (form) {
            //extract info submitted in the form
            //info is new product
            //to create instances of the model = create new row
            const uom = new UOM();
            uom.set('name', form.data.name)
            uom.set('description', form.data.description)

            //save 
            await uom.save()
            res.redirect('/uoms')
        },
        "error": function (form) {
            res.render('uoms/create', {
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": function (form) {
            res.render('uoms/create', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:uom_id/update', async function (req, res) {
    //get item
    const uom = await UOM.where({
        'id': req.params.uom_id
    }).fetch({
        require: true
    }); //add try catch later pls to catch exception
    
    //create form
    const uomForm = createUOMForm();
    uomForm.fields.name.value = uom.get('name')
    uomForm.fields.description.value = uom.get('description')


    res.render('uoms/update', {
        form: uomForm.toHTML(bootstrapField)
    })
})

router.post('/:uom_id/update', async function (req, res) {
    const uomForm = createUOMForm();
    const uom = await UOM.where({
        id: req.params.uom_id
    }).fetch({
        require: true
    })
    uomForm.handle(req, {
        "success": async function (form) {
            //extract info submitted in the form
            //info is new product
            //to create instances of the model = create new row
            const uom = new UOM();
            uom.set('name', form.data.name)
            uom.set('description', form.data.description)
            //save 
            await uom.save()
            res.redirect('/uoms')
        },
        "error": function (form) {
            res.render('uoms/create', {
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": function (form) {
            res.render('uoms/create', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:uom_id/delete', async function (req, res) {
    try {
        // Get item
        const uom = await UOM.where({
            'id': req.params.uom_id
        }).fetch({
            require: true
        });

        res.render('uoms/delete', {
            uom: uom.toJSON()
        });
    } catch (err) {
        console.error(err);
        res.redirect('/uoms'); // Redirect or handle the error as needed
    }
});

router.post('/:uom_id/delete', async function (req, res) {
    try {
        const uom = await UOM.where({
            'id': req.params.uom_id
        }).fetch({
            require: true
        });
        await uom.destroy();
        res.redirect("/uoms");
    } catch (err) {
        console.error(err);
        res.redirect('/uoms'); // Redirect or handle the error as needed
    }
});


module.exports = router;