const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();



//import all dependencies for sessions
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

// create an instance of express app
let app = express();

if (!process.env.SESSION_SECRET) {
    console.error('SESSION_SECRET is not defined in the environment variables');
    process.exit(1); // Exit the application if SESSION_SECRET is missing
}


// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);

// enable sessions
app.use(session({
    store: new FileStore(),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

// enable flash messaging
app.use(flash());

app.use(function (req, res, next) {
    // res.locals contains all the variable
    // that hbs files have access to
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");

    next();
})

const landingRoutes = require('./routes/landing.js')
const productRoutes = require('./routes/products.js')
const uomRoutes = require('./routes/uoms.js')
const userRoutes = require('./routes/users.js')

async function main() {
    app.use('/', landingRoutes)
    app.use('/products', productRoutes)
    app.use('/uoms', uomRoutes)
    app.use('/users', userRoutes)
}

main();

process.once("SIGUSR2", () => 
    server.close(err => {
        if (err) {
            console.error("Error while closing server:", err);
        }
        process.kill(process.pid, "SIGUSR2");
    })
);

app.listen(5000, () => {
    console.log("Server has started");
});