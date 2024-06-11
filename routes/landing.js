const express = require('express');
const router = express.Router()

router.get('/', function (req, res) {
    if (req.session.visitCount) {
        req.session.visitCount++
    }
    else {
        req.session.visitCount = 1
    }
    res.render('landing/index')
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

module.exports = router;
