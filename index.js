const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const csurf = require('csurf');
const cors = require('cors')


if (!process.env.SESSION_SECRET) {
    console.error('SESSION_SECRET is not defined in the environment variables');
    process.exit(1); // Exit the application if SESSION_SECRET is missing
}

// Import all dependencies for sessions
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

// Create an instance of express app
let app = express();

// Set the view engine
app.set("view engine", "hbs");

// Static folder
app.use(express.static("public"));

// enable cors
app.use(cors())

// Setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// Enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);

// Enable sessions with error handling
app.use((req, res, next) => {
    session({
        store: new FileStore(),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true
    })(req, res, (err) => {
        if (err) {
            console.error('Session error:', err);
        }
        next();
    });
});

// Enable flash messaging
app.use(flash());

app.use(function (req, res, next) {
    // res.locals contains all the variables that hbs files have access to
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");

    next();
});

app.use(function(req,res, next){
    if(req.session.username) {
        res.locals.username = req.session.username;
    }
    next();
});
//enable csurf and exclude for stripe checkout
const csurfInstance = csurf()
app.use(function(req,res,next){
    if(req.url == "/checkout/process_payment" || req.url.slice(0,5)=='/api/') {
        return next();
    }
    csurfInstance(req,res,next)
})

app.use(function (req,res,next) {
    res.locals.csrfToken = req.csrfToken();
    next();
})
//write error handler for a middleware as its next middleware
app.use(function(err, req,res,next) {
    if (err && err.code == "EBADCSRFTOKEN"){
        req.flash("error_messages", "The form has expired")
        res.redirect('back')
    } else {
        next()
    }
})

const landingRoutes = require('./routes/landing.js');
const productRoutes = require('./routes/products.js');
const uomRoutes = require('./routes/uoms.js');
const userRoutes = require('./routes/users.js');
const cloudinaryRoutes = require('./routes/cloudinary.js')
const cartRoutes = require('./routes/shoppingCart.js')
const checkoutRoutes = require('./routes/checkout.js')
const api = {
    products: require('./routes/api/products.js'),
    users: require('./routes/api/users.js')
}

async function main() {
    app.use('/', landingRoutes);
    app.use('/products', productRoutes);
    app.use('/uoms', uomRoutes);
    app.use('/users', userRoutes);
    app.use('/cloudinary', cloudinaryRoutes);
    app.use('/cart', cartRoutes);
    app.use('/checkout', checkoutRoutes)
    app.use('/api/products', express.json(), api.products)
}

main();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Gracefully handle SIGUSR2 signal (for nodemon restarts)
process.once("SIGUSR2", () =>
    server.close(err => {
        if (err) {
            console.error("Error while closing server:", err);
        }
        process.kill(process.pid, "SIGUSR2");
    })
);
