const express = require('express');
const bycrypt = require('bcrypt')
const { User } = require('../models')
const { createRegistrationForm, bootstrapField, createLoginForm } = require('../forms');
const { checkifAuthenticated } = require('../middlewares');
const router = express.Router();

router.get('/signup', function (req, res) {
    const form = createRegistrationForm();
    res.render('users/signup', {
        form: form.toHTML(bootstrapField)
    })
})

router.post('/signup', function (req, res) {
    const newUser = createRegistrationForm()
    newUser.handle(req, {
        "success": async function (form) {
            const user = new User();
            user.set({
                username: form.data.username,
                email: form.data.email,
                password: await bycrypt.hash(form.data.password, 10)
            })
            user.save()
            req.flash("Your account has been created, please login!");
            res.redirect('/users/login')
        },
        "emmpty": function (form) {
            res.render('users/signup', {
                form: form.toHTML(bootstrapField)
            })
        },
        "error": function (form) {
            res.render('users/signup', {
                form: form.toHTML(bootstrapField)
            })
        }
    })

})

router.get('/login', function (req, res) {
    const form = createLoginForm();
    res.render('users/login', {
        form: form.toHTML(bootstrapField)
    })

})

router.post('/login', function (req, res) {
    const form = createLoginForm();
    form.handle(req, {
        "success": async function (form) {
            try {
                const user = await User.where({
                    email: form.data.email
                }).fetch({
                    require: false
                });

                if (user) {
                    if (await bycrypt.compare(form.data.password, user.get("password"))) {
                        req.session.userId = user.get('id');
                        res.redirect('/users/profile')
                    }
                } else {
                    req.flash("error_messages", "Unable to log in");
                    res.redirect('/users/login');
                }

            } catch (error) {
                console.error('Error during login process:', error);
                req.flash("error_messages", "An unexpected error occurred. Please try again later.");
                res.redirect('/users/login');
            }
        },

        "empty": function (form) {
            res.render('users/login', {
                form: form.toHTML(bootstrapField)
            })
        },
        "error": function (form) {
            res.render('users/login', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/profile', [checkifAuthenticated], async function (req, res) {
    res.render('users/profile', {
        user: req.session.user
    });
});

router.get('/logout', function (req, res) {
    req.session.userId = null;
    req.session.user = null; // Also clear the user session data
    req.flash("success_messages", "You have logged out successfully. See you again!");
    res.redirect('/users/login');
});

module.exports = router;