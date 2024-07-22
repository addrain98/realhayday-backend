const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary');
//setup cloudinary library
cloudinary.config({
    'api_key': process.env.CLOUDINARY_API_KEY,
    'api_secret': process.env.CLOUDINARY_API_SECRET
})
router.get('/sign', function(req,res) {
    //get the parameters to sign
    const paramsToSign = JSON.parse(req.query.params_to_sign);
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)
    res.send(signature);
})

module.exports = router