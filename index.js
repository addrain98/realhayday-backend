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

app.use(session({
    store: new FileStore(),
    secret: "Keyboard",
    resave: false,
    saveUninitialized:true
}))
//enable flash message
app.use(flash())

const landingRoutes = require('./routes/landing.js')
const productRoutes = require('./routes/products.js')
const uomRoutes = require('./routes/uoms.js')

async function main() {
    app.use('/', landingRoutes)
    app.use('/products', productRoutes)
    app.use('/uoms',uomRoutes)
}

main();

app.listen(3001, () => {
    console.log("Server has started");
});