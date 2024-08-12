const { User } = require('../models'); 

const checkifAuthenticated = async function (req, res, next) {
    if (req.session.userId) {
        if (!req.session.user) {
            const user = await User.where({
                id: req.session.userId
            }).fetch({
                required: true
            });
            // Save only username and email
            const userData = user.toJSON();
            req.session.user = {
                username: userData.username,
                email: userData.email
            };
        }
        next();
    } else {
        req.flash("error_messages", "You must log in to view this page");
        res.redirect("/users/login");
    }
};

const jwt = require('jsonwebtoken');
// ..snipped
const checkIfAuthenticatedJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = {
    checkifAuthenticated,
    checkIfAuthenticatedJWT
};