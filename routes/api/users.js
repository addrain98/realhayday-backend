const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');

const generateAccessToken = (user) => {
    return jwt.sign({
        'id': user.id
    }, process.env.TOKEN_SECRET, {
        expiresIn: "1h"
    });
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}



router.post('/login', async (req, res) => {
    let user = await User.where({
        'email': req.body.email
    }).fetch({
        require: false
    });

    if (user && await bcrypt.compare(req.body.password, user.get('password'))) {
        let accessToken = generateAccessToken(user);
        res.json({
            accessToken
        })
    } else {
        res.status(401)
        res.json({
            'error':'Wrong email or password'
        })
    }
})

const {checkIfAuthenticatedJWT} = require('../../middlewares')

router.get('/profile', checkIfAuthenticatedJWT, async(req,res)=>{
    const user = req.user;
    res.send(user);
})

module.exports = router;